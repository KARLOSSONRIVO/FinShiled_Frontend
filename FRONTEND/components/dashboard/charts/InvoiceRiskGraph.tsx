"use client"

import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { RiskGraphPoint } from "@/lib/chart-utils"

interface InvoiceRiskGraphProps {
    data: RiskGraphPoint[]
    title?: string
    cleanLabel?: string
    flaggedLabel?: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs space-y-1">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((entry: any) => (
                <div key={entry.name} className="flex items-center gap-2">
                    <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: entry.color ?? entry.fill }}
                    />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-medium text-foreground">
                        {entry.name === "Risk %" ? `${entry.value}%` : entry.value}
                    </span>
                </div>
            ))}
        </div>
    )
}

export function InvoiceRiskGraph({
    data,
    title = "Invoice Risk Graph",
    cleanLabel = "Clean Invoice",
    flaggedLabel = "Flagged Invoice",
}: InvoiceRiskGraphProps) {
    const isEmpty = data.every(d => d.clean === 0 && d.flagged === 0)

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
                {isEmpty ? (
                    <div className="flex h-[220px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">No invoice data available</p>
                    </div>
                ) : (
                    <div className="h-[220px] md:h-[260px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{ top: 8, right: 20, left: -10, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="currentColor"
                                    strokeOpacity={0.08}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                    label={{
                                        value: "Invoice Total",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 14,
                                        style: { fontSize: 10, fill: "currentColor", opacity: 0.5 },
                                    }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                    label={{
                                        value: "Risk %",
                                        angle: 90,
                                        position: "insideRight",
                                        offset: 14,
                                        style: { fontSize: 10, fill: "currentColor", opacity: 0.5 },
                                    }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                                    iconType="circle"
                                    iconSize={8}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="clean"
                                    name={cleanLabel}
                                    fill="#10b981"
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={28}
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="flagged"
                                    name={flaggedLabel}
                                    fill="#ef4444"
                                    radius={[3, 3, 0, 0]}
                                    maxBarSize={28}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="risk"
                                    name="Risk %"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="4 2"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
