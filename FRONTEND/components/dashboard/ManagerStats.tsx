"use client"

import { FileText, CheckCircle, AlertTriangle, Users } from "lucide-react"
import { cn } from "@/lib/utils"
 
interface ManagerStatsProps {
    totalInvoices: number
    flaggedCount: number
    employeeCount: number
    totalValue: number
}
 
export function ManagerStats({ totalInvoices, flaggedCount, employeeCount, totalValue }: ManagerStatsProps) {
    const renderCard = (
        title: string,
        value: string | number,
        icon: React.ReactNode,
        colorClass: string,
        bgGlow: string,
        colSpanClass: string
    ) => {
        const isLongValue = value.toString().length > 10
        return (
            <div className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-black/10 dark:hover:border-white/10",
                colSpanClass
            )}>
                <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-30 group-hover:scale-150 ${bgGlow}`} />
                <div className="relative z-10 flex items-center justify-between gap-3">
                    <div className="space-y-2 min-w-0 flex-1">
                        <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase truncate">{title}</p>
                        <h3 className={cn(
                            "font-black tracking-tight text-foreground truncate transition-all duration-300",
                            isLongValue 
                                ? "text-2xl sm:text-3xl lg:text-3xl" 
                                : "text-3xl sm:text-4xl lg:text-4xl"
                        )}>{value}</h3>
                    </div>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm border border-border/50 ring-1 ring-black/5 dark:ring-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorClass}`}>
                        {icon}
                    </div>
                </div>
            </div>
        )
    }
 
    // Format total value as currency
    const formattedTotalValue = `₱${(totalValue || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`
 
    return (
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-[repeat(24,minmax(0,1fr))] gap-6 mb-8">
            {renderCard(
                "Total Invoices",
                totalInvoices.toLocaleString(),
                <FileText className="h-7 w-7" />,
                "text-[#3b5998]",
                "bg-[#3b5998]",
                "md:col-span-2 lg:col-span-5"
            )}
            {renderCard(
                "Flagged Items",
                flaggedCount.toLocaleString(),
                <AlertTriangle className="h-7 w-7" />,
                "text-red-500",
                "bg-red-500",
                "md:col-span-2 lg:col-span-5"
            )}
            {renderCard(
                "Active Employees",
                employeeCount.toLocaleString(),
                <Users className="h-7 w-7" />,
                "text-amber-500",
                "bg-amber-500",
                "md:col-span-2 lg:col-span-5"
            )}
            {renderCard(
                "Invoice Volume",
                formattedTotalValue,
                <CheckCircle className="h-7 w-7" />,
                "text-emerald-500",
                "bg-emerald-500",
                "md:col-span-6 lg:col-span-9"
            )}
        </div>
    )
} 