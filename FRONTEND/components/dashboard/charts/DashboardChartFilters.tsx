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
}

export function DashboardChartFilters({
    period,
    onPeriodChange,
    showCompanyFilter = false,
    company = "all",
    onCompanyChange,
    companies = [],
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
                </SelectContent>
            </Select>
        </div>
    )
}
