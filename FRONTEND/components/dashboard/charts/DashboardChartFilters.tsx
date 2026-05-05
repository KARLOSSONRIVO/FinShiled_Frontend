"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CalendarDays, Building2 } from "lucide-react"
import type { Period } from "@/lib/chart-utils"

interface DashboardChartFiltersProps {
    period: Period
    onPeriodChange: (value: Period) => void
    showCompanyFilter?: boolean
    company?: string
    onCompanyChange?: (value: string) => void
    companies?: string[]
    
    // New Range Props
    dateRange?: string
    onDateRangeChange?: (value: string) => void
    availableYears?: number[]
}

export function DashboardChartFilters({
    period,
    onPeriodChange,
    showCompanyFilter = false,
    company = "all",
    onCompanyChange,
    companies = [],
    dateRange,
    onDateRangeChange,
    availableYears,
}: DashboardChartFiltersProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {showCompanyFilter && (
                <Select value={company} onValueChange={onCompanyChange}>
                    <SelectTrigger
                        size="sm"
                        className="gap-1.5 text-xs h-8 pr-2 border-border/60 bg-card"
                    >
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Companies</SelectItem>
                        {companies.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
                <SelectTrigger
                    size="sm"
                    className="gap-1.5 text-xs h-8 pr-2 border-border/60 bg-card"
                >
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
            </Select>

            {dateRange && onDateRangeChange && (
                <Select value={dateRange} onValueChange={onDateRangeChange}>
                    <SelectTrigger
                        size="sm"
                        className="gap-1.5 text-xs h-8 pr-2 border-border/60 bg-card"
                    >
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {period === "weekly" && (
                            <>
                                <SelectItem value="1">Last 1 Week</SelectItem>
                                <SelectItem value="2">Last 2 Weeks</SelectItem>
                                <SelectItem value="3">Last 3 Weeks</SelectItem>
                                <SelectItem value="4">Last 4 Weeks</SelectItem>
                            </>
                        )}
                        {period === "monthly" && (
                            <>
                                <SelectItem value="1">Last 1 Month</SelectItem>
                                <SelectItem value="3">Last 3 Months</SelectItem>
                                <SelectItem value="6">Last 6 Months</SelectItem>
                                <SelectItem value="12">Last 12 Months</SelectItem>
                            </>
                        )}
                        {period === "yearly" && (
                            <>
                                <SelectItem value="all">All Years</SelectItem>
                                {availableYears?.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </>
                        )}
                    </SelectContent>
                </Select>
            )}
        </div>
    )
}
