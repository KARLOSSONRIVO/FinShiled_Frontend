"use client"

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { ReportDataPoint } from "@/lib/chart-utils"

interface InvoiceValueChartProps {
    data: ReportDataPoint[]
    title?: string
}

const formatValue = (v: number) =>
    v >= 1_000_000
        ? `₱${(v / 1_000_000).toFixed(1)}M`
        : v >= 1_000
        ? `₱${(v / 1_000).toFixed(0)}K`
        : `₱${v.toFixed(0)}`

export function InvoiceValueChart({ data, title = "Invoice Value Over Time" }: InvoiceValueChartProps) {
    return (
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tickFormatter={formatValue}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                    />
                    <Tooltip
                        formatter={(v: number) => [formatValue(v), "Total Value"]}
                        contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "13px",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                        dot={false}
                        activeDot={{ r: 4, fill: "#6366f1" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
