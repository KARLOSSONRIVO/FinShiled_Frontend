"use client"

import { useState, useMemo } from "react"

import { FinancialOverview } from "@/components/reports/FinancialOverview"
import { StatusBreakdown } from "@/components/reports/StatusBreakdown"
import { RiskAnalysis } from "@/components/reports/RiskAnalysis"
import { InvoiceValueChart } from "@/components/reports/charts/InvoiceValueChart"
import { StatusTrendChart } from "@/components/reports/charts/StatusTrendChart"
import { ReportPeriodToggle, ReportPeriod } from "@/components/reports/charts/ReportPeriodToggle"
import { ReportDownloadMenu } from "@/components/reports/charts/ReportDownloadMenu"
import { useAuditorReports } from "@/hooks/auditor/use-auditor-reports"
import { DashboardContentSkeleton } from "@/components/skeletons/dashboard-content-skeleton"
import { groupInvoicesForReports, filterInvoicesByPeriod } from "@/lib/chart-utils"

// Default sub-range per period
const DEFAULT_RANGE: Record<ReportPeriod, string> = {
  weekly: "4",
  monthly: "6",
  yearly: "4",
}

export default function AuditorReportsPage() {
  const { invoices, metrics, statusCounts, riskMetrics, isLoading } = useAuditorReports()
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("monthly")
  const [subRange, setSubRange] = useState("6")

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

  if (isLoading) return <DashboardContentSkeleton />

  return (
    <div className="space-y-6">
      {/* Page title — plain text, no icon, no bold */}
      <h1 className="text-2xl font-normal tracking-tight text-foreground/90">
        Auditor Reports
      </h1>

      <div className="space-y-6 w-full">
        {/* Top Summary Cards */}
        <FinancialOverview
          total={metrics.totalValue}
          verifiedValue={metrics.verifiedValue}
          flagged={metrics.flaggedValue}
        />

        {/* Filter + download row — sits below summary cards */}
        <div className="flex items-center gap-3">
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

        {/* Bottom grid: Status breakdown + Risk analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusBreakdown
            counts={statusCounts}
            total={invoices.length}
          />

          <RiskAnalysis
            averageRiskScore={riskMetrics.averageRiskScore}
            verifiedCount={riskMetrics.verifiedCount}
            flaggedCount={riskMetrics.aiFlaggedCount}
            fraudRate={riskMetrics.fraudRate}
            fraudCount={riskMetrics.fraudCount}
            totalInvoices={invoices.length}
          />
        </div>
      </div>
    </div>
  )
}
