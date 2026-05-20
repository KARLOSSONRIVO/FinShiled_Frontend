"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { ReportDataPoint } from "@/lib/chart-utils"

interface StatusTrendChartProps {
    data: ReportDataPoint[]
    title?: string
}

const BARS = [
    { key: "approved", label: "Approved", color: "#10b981" },
    { key: "rejected", label: "Rejected", color: "#ef4444" },
] as const

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl border border-border/50 bg-card shadow-lg p-3 text-xs space-y-1.5 min-w-[140px]">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {BARS.map((b) => {
                const entry = payload.find((p: any) => p.dataKey === b.key)
                if (!entry) return null
                return (
                    <div key={b.key} className="flex items-center justify-between gap-6">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: b.color }} />
                            {b.label}
                        </span>
                        <span className="font-bold text-foreground">{entry.value}</span>
                    </div>
                )
            })}
        </div>
    )
}

export function StatusTrendChart({ data, title = "Invoice Status Trend" }: StatusTrendChartProps) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-6">{title}</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart
                    data={data}
                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    barCategoryGap="30%"
                    barGap={4}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                    />
                    {/* No cursor fill — avoids the dark grey hover overlay */}
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }}
                    />
                    <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={44} />
                    <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
