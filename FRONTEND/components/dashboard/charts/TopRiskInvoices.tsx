"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert } from "lucide-react"

interface RiskInvoice {
    id: string
    invoiceNumber?: string
    invoiceNo?: string
    companyName?: string
    aiVerdict?: { verdict?: string; riskScore?: number }
    status?: string
}

interface TopRiskInvoicesProps {
    invoices: RiskInvoice[]
    title?: string
    emptyMessage?: string
}

function RiskBadge({ score }: { score: number }) {
    const rounded = Math.round(score)
    const color =
        rounded >= 75
            ? "bg-red-500/10 text-red-500 border-red-500/20"
            : rounded >= 50
            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"

    return (
        <span
            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums shrink-0 ${color}`}
        >
            {rounded}
        </span>
    )
}

const MAX_ROWS = 6

export function TopRiskInvoices({
    invoices,
    title = "Top Risk Invoices",
    emptyMessage = "No risk scores available",
}: TopRiskInvoicesProps) {
    // Sort by riskScore descending, take top MAX_ROWS
    const sorted = [...invoices]
        .filter((inv) => typeof inv.aiVerdict?.riskScore === "number")
        .sort((a, b) => (b.aiVerdict!.riskScore ?? 0) - (a.aiVerdict!.riskScore ?? 0))
        .slice(0, MAX_ROWS)

    return (
        <Card className="h-full border border-border/50 shadow-sm flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-4 flex-1">
                {sorted.length === 0 ? (
                    <div className="flex h-full min-h-[160px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_auto] gap-2 pb-2 border-b border-border/40">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Invoice
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground text-right">
                                Risk
                            </span>
                        </div>

                        {sorted.map((inv, idx) => {
                            const number = inv.invoiceNumber || inv.invoiceNo || `#${idx + 1}`
                            const score = inv.aiVerdict?.riskScore ?? 0
                            const statusStr = String(inv.status ?? "").toLowerCase()
                            const statusColor =
                                statusStr === "flagged" || statusStr === "rejected"
                                    ? "text-red-500"
                                    : statusStr === "clean" || statusStr === "approved" || statusStr === "anchored"
                                    ? "text-emerald-500"
                                    : "text-amber-500"

                            return (
                                <div
                                    key={inv.id || idx}
                                    className="grid grid-cols-[1fr_auto] gap-2 py-2.5 border-b border-border/20 last:border-0 items-center"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">
                                            {number}
                                        </p>
                                        {inv.companyName && (
                                            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                                {inv.companyName}
                                            </p>
                                        )}
                                        <p className={`text-[10px] font-medium mt-0.5 capitalize ${statusColor}`}>
                                            {inv.status || "pending"}
                                        </p>
                                    </div>
                                    <RiskBadge score={score} />
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
