"use client"

import { useState, useMemo } from "react"
import { useManagerReports } from "@/hooks/company-manager/reports/use-manager-reports"
import { DashboardContentSkeleton } from "@/components/skeletons/dashboard-content-skeleton"
import { FinancialOverview } from "@/components/reports/FinancialOverview"
import { StatusBreakdown } from "@/components/reports/StatusBreakdown"
import { RiskAnalysis } from "@/components/reports/RiskAnalysis"
import { InvoiceValueChart } from "@/components/reports/charts/InvoiceValueChart"
import { StatusTrendChart } from "@/components/reports/charts/StatusTrendChart"
import { ReportPeriodToggle, ReportPeriod } from "@/components/reports/charts/ReportPeriodToggle"
import { ReportDownloadMenu } from "@/components/reports/charts/ReportDownloadMenu"
import { groupInvoicesForReports, filterInvoicesByPeriod } from "@/lib/chart-utils"
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const DEFAULT_RANGE: Record<ReportPeriod, string> = {
    weekly: "4",
    monthly: "6",
    yearly: "4",
}

// Simulated auditor metrics from localStorage audit logs
function useAuditorMetrics() {
    if (typeof window === "undefined") {
        return { verified: 0, rejected: 0, escalated: 0, total: 0, verifiedRate: 0 }
    }
    try {
        const logs = JSON.parse(localStorage.getItem("finshield_audit_logs") || "[]")
        const verified = logs.filter((l: any) => l.action === "INVOICE_VERIFIED").length
        const rejected = logs.filter((l: any) => l.action === "INVOICE_REJECTED").length
        const escalated = logs.filter((l: any) => l.action === "INVOICE_ESCALATED").length
        const total = verified + rejected + escalated
        return { verified, rejected, escalated, total, verifiedRate: total > 0 ? Math.round((verified / total) * 100) : 0 }
    } catch { return { verified: 0, rejected: 0, escalated: 0, total: 0, verifiedRate: 0 } }
}

export default function AuditorReportsPage() {
    const { invoices, metrics, statusCounts, riskMetrics, totalCount, isLoading } = useManagerReports()
    const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("monthly")
    const [subRange, setSubRange] = useState("6")
    const auditorMetrics = useAuditorMetrics()

    const handlePeriodChange = (p: ReportPeriod) => {
        setReportPeriod(p)
        setSubRange(DEFAULT_RANGE[p])
    }

    const reportData = useMemo(() => {
        const n = parseInt(subRange)
        return groupInvoicesForReports(invoices, reportPeriod, n)
    }, [invoices, reportPeriod, subRange])

    const filteredInvoicesForDownload = useMemo(() => {
        const n = parseInt(subRange)
        return filterInvoicesByPeriod(invoices, reportPeriod, n)
    }, [invoices, reportPeriod, subRange])

    const periodLabel = reportPeriod === "weekly"
        ? `Last ${subRange} Week${subRange !== "1" ? "s" : ""}`
        : reportPeriod === "monthly"
        ? `Last ${subRange} Month${subRange !== "1" ? "s" : ""}`
        : `Last ${subRange} Years`

    const auditSummaryCards = [
        {
            label: "Invoices Verified", value: auditorMetrics.verified,
            icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30"
        },
        {
            label: "Invoices Rejected", value: auditorMetrics.rejected,
            icon: XCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30"
        },
        {
            label: "Escalated to Admin", value: auditorMetrics.escalated,
            icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30"
        },
        {
            label: "Verification Rate", value: `${auditorMetrics.verifiedRate}%`,
            icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/30"
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-normal tracking-tight">Auditor Reports</h2>
                <p className="text-sm text-muted-foreground">
                    Overview of audit performance, invoice risk trends, and decision history.
                </p>
            </div>

            {/* Auditor-specific action summary */}
            <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Audit Activity</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {auditSummaryCards.map((card, i) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="p-4 rounded-xl border bg-card shadow-sm flex items-center gap-4"
                        >
                            <div className={cn("p-3 rounded-lg", card.bg)}>
                                <card.icon className={cn("h-5 w-5", card.color)} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{card.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <DashboardContentSkeleton />
            ) : (
                <>
                    {/* Company Financial Overview */}
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company Invoice Overview</h3>
                        <FinancialOverview
                            total={metrics.totalValue}
                            verifiedValue={metrics.verifiedValue}
                            flagged={metrics.flaggedValue}
                        />
                    </div>

                    {/* Period Filter + Download */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <ReportPeriodToggle
                            value={reportPeriod}
                            onChange={handlePeriodChange}
                            subRange={subRange}
                            onSubRangeChange={setSubRange}
                        />
                        <ReportDownloadMenu
                            invoices={filteredInvoicesForDownload}
                            filename={`auditor-report-${periodLabel.toLowerCase().replace(/ /g, "-")}`}
                        />
                    </div>

                    {/* Charts */}
                    <InvoiceValueChart
                        data={reportData}
                        title={`Invoice Value — ${periodLabel}`}
                    />
                    <StatusTrendChart
                        data={reportData}
                        title={`Invoice Status Trend — ${periodLabel}`}
                    />

                    {/* Breakdown grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StatusBreakdown counts={statusCounts} total={totalCount} />
                        <RiskAnalysis
                            averageRiskScore={riskMetrics.averageRiskScore}
                            verifiedCount={riskMetrics.verifiedCount}
                            flaggedCount={riskMetrics.aiFlaggedCount}
                            fraudRate={riskMetrics.fraudRate}
                            fraudCount={riskMetrics.fraudCount}
                            totalInvoices={totalCount}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
