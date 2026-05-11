"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle, PieChart as PieIcon } from "lucide-react"

interface StatusCounts {
    approved: number
    pending: number
    rejected: number
}

interface StatusBreakdownProps {
    counts: StatusCounts
    total: number
}

const STATUSES = [
    { key: "approved", label: "Approved",  color: "#10b981", icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
    { key: "pending",  label: "Pending",   color: "#f59e0b", icon: Clock,         bg: "bg-amber-50 dark:bg-amber-950/30",   text: "text-amber-600 dark:text-amber-400" },
    { key: "rejected", label: "Rejected",  color: "#ef4444", icon: XCircle,       bg: "bg-red-50 dark:bg-red-950/30",       text: "text-red-600 dark:text-red-400" },
] as const

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
        <div className="rounded-xl border border-border/50 bg-card shadow-lg px-3 py-2 text-xs">
            <span className="font-semibold text-foreground">{d.name}: </span>
            <span className="text-muted-foreground">{d.value} invoices ({d.payload.pct}%)</span>
        </div>
    )
}

export function StatusBreakdown({ counts, total }: StatusBreakdownProps) {
    const pct = (n: number) => (total > 0 ? ((n / total) * 100).toFixed(1) : "0.0")

    const data = STATUSES.map((s) => ({
        name: s.label,
        value: counts[s.key],
        pct: pct(counts[s.key]),
        color: s.color,
    }))

    // If all zero, show a grey placeholder slice
    const chartData = data.every((d) => d.value === 0)
        ? [{ name: "No data", value: 1, pct: "0.0", color: "hsl(var(--muted))" }]
        : data.filter((d) => d.value > 0)

    return (
        <Card className="h-full border-border/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <PieIcon className="h-4 w-4 text-primary" />
                    Invoice Status Breakdown
                </CardTitle>
                <CardDescription>Distribution of invoice review statuses</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-5">
                    {/* Donut chart */}
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={52}
                                outerRadius={82}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Stat rows */}
                    <div className="space-y-3">
                        {STATUSES.map((s) => {
                            const count = counts[s.key]
                            const percent = pct(count)
                            const Icon = s.icon
                            return (
                                <div key={s.key} className={`flex items-center justify-between rounded-xl px-4 py-3 ${s.bg}`}>
                                    <div className="flex items-center gap-2.5">
                                        <Icon className={`h-4 w-4 ${s.text}`} />
                                        <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="font-bold text-foreground">{count}</span>
                                        <span className="text-xs text-muted-foreground w-10 text-right">{percent}%</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Total */}
                    <p className="text-xs text-center text-muted-foreground pt-1">
                        {total} total invoice{total !== 1 ? "s" : ""} in this period
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
