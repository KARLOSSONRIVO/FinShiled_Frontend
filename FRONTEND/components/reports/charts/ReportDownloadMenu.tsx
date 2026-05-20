"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    exportToCSV,
    exportToExcel,
    invoicesToExportRows,
} from "@/lib/report-export"

interface ReportDownloadMenuProps {
    /** Raw invoice objects to export */
    invoices: any[]
    /** Base filename without extension, e.g. "manager-report-2026-05" */
    filename?: string
}

export function ReportDownloadMenu({ invoices, filename = "finshield-report" }: ReportDownloadMenuProps) {
    const [loading, setLoading] = useState<"csv" | "xlsx" | null>(null)

    const handleDownload = async (type: "csv" | "xlsx") => {
        if (!invoices.length) return
        setLoading(type)

        // Yield to browser to show loading state before blocking export
        await new Promise((r) => setTimeout(r, 50))

        const rows = invoicesToExportRows(invoices)
        if (type === "csv") {
            exportToCSV(rows, filename)
        } else {
            exportToExcel(rows, filename)
        }

        setLoading(null)
    }

    const isLoading = loading !== null
    const count = invoices.length

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 text-sm font-medium"
                    disabled={isLoading || count === 0}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    Download
                    {count > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">({count})</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={() => handleDownload("csv")}
                    disabled={isLoading}
                    className="gap-2 cursor-pointer"
                >
                    <FileText className="h-4 w-4 text-emerald-500" />
                    Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleDownload("xlsx")}
                    disabled={isLoading}
                    className="gap-2 cursor-pointer"
                >
                    <FileSpreadsheet className="h-4 w-4 text-indigo-500" />
                    Download Excel (.xlsx)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
