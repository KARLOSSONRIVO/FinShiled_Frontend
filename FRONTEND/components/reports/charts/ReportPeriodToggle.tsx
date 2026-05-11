"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type ReportPeriod = "monthly" | "yearly"

interface ReportPeriodToggleProps {
    value: ReportPeriod
    onChange: (v: ReportPeriod) => void
}

export function ReportPeriodToggle({ value, onChange }: ReportPeriodToggleProps) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as ReportPeriod)}>
            <SelectTrigger className="w-[140px] h-9 text-sm font-medium">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="monthly">Last 6 Months</SelectItem>
                <SelectItem value="yearly">Last 4 Years</SelectItem>
            </SelectContent>
        </Select>
    )
}
