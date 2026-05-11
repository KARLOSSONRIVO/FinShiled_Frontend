"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CalendarDays } from "lucide-react"

export type ReportPeriod = "weekly" | "monthly" | "yearly"

interface ReportPeriodToggleProps {
    value: ReportPeriod
    onChange: (v: ReportPeriod) => void
    subRange?: string
    onSubRangeChange?: (v: string) => void
}

export function ReportPeriodToggle({
    value,
    onChange,
    subRange,
    onSubRangeChange,
}: ReportPeriodToggleProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Primary: period */}
            <Select value={value} onValueChange={(v) => onChange(v as ReportPeriod)}>
                <SelectTrigger size="sm" className="gap-1.5 text-xs h-8 pr-2 border-border/60 bg-card">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
            </Select>

            {/* Secondary: sub-range */}
            {subRange !== undefined && onSubRangeChange && (
                <Select value={subRange} onValueChange={onSubRangeChange}>
                    <SelectTrigger size="sm" className="gap-1.5 text-xs h-8 pr-2 border-border/60 bg-card">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {value === "weekly" && (
                            <>
                                <SelectItem value="1">Last 1 Week</SelectItem>
                                <SelectItem value="2">Last 2 Weeks</SelectItem>
                                <SelectItem value="3">Last 3 Weeks</SelectItem>
                                <SelectItem value="4">Last 4 Weeks</SelectItem>
                            </>
                        )}
                        {value === "monthly" && (
                            <>
                                <SelectItem value="1">Last 1 Month</SelectItem>
                                <SelectItem value="3">Last 3 Months</SelectItem>
                                <SelectItem value="6">Last 6 Months</SelectItem>
                                <SelectItem value="12">Last 12 Months</SelectItem>
                            </>
                        )}
                        {value === "yearly" && (
                            <>
                                <SelectItem value="2">Last 2 Years</SelectItem>
                                <SelectItem value="3">Last 3 Years</SelectItem>
                                <SelectItem value="4">Last 4 Years</SelectItem>
                            </>
                        )}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}
