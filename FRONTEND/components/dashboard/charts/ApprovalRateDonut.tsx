"use client"

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ApprovalPoint } from "@/lib/chart-utils"

interface ApprovalRateDonutProps {
    data: ApprovalPoint[]
    title?: string
}

const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const { name, value, payload: inner } = payload[0]
    return (
        <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
            <div className="flex items-center gap-2">
                <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: inner.color }}
                />
                <span className="text-muted-foreground">{name}:</span>
                <span className="font-semibold text-foreground">{value}</span>
            </div>
        </div>
    )
}

export function ApprovalRateDonut({
    data,
    title = "Approval Rate",
}: ApprovalRateDonutProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    const isEmpty = total === 0

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                {isEmpty ? (
                    <div className="flex h-[220px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">No data available</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 py-2">
                        {/* Donut */}
                        <div className="h-[180px] w-[180px] md:h-[220px] md:w-[220px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="85%"
                                        strokeWidth={3}
                                        stroke="hsl(var(--card))"
                                        paddingAngle={2}
                                    >
                                        {data.map((entry) => (
                                            <Cell key={entry.name} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap md:flex-col justify-center gap-4 md:gap-3 shrink-0">
                            {data.map((entry) => {
                                const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
                                return (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <span
                                            className="h-3 w-3 rounded-full shrink-0"
                                            style={{ background: entry.color }}
                                        />
                                        <div className="text-xs">
                                            <p className="text-muted-foreground leading-none">{entry.name}</p>
                                            <p className="font-semibold text-foreground mt-1">
                                                {entry.value}
                                                <span className="font-normal text-muted-foreground ml-1">
                                                    ({pct}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
