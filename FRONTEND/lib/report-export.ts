import * as XLSX from "xlsx"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Any flat object with string keys — one row in the export. */
type ExportRow = Record<string, string | number | boolean | null | undefined>

// ---------------------------------------------------------------------------
// CSV export — zero extra deps, pure browser Blob
// ---------------------------------------------------------------------------

export function exportToCSV(rows: ExportRow[], filename: string): void {
    if (!rows.length) return

    const headers = Object.keys(rows[0])
    const escape = (v: unknown) => {
        const s = v == null ? "" : String(v)
        // Wrap in quotes if the value contains commas, quotes, or newlines
        return s.includes(",") || s.includes('"') || s.includes("\n")
            ? `"${s.replace(/"/g, '""')}"`
            : s
    }

    const csv = [
        headers.map(escape).join(","),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
    a.click()
    URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Excel export — uses SheetJS (xlsx)
// ---------------------------------------------------------------------------

export function exportToExcel(rows: ExportRow[], filename: string): void {
    if (!rows.length) return

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report")

    // Auto-width columns
    const headers = Object.keys(rows[0])
    const colWidths = headers.map((h) => ({
        wch: Math.max(
            h.length,
            ...rows.map((r) => String(r[h] ?? "").length)
        ) + 2,
    }))
    worksheet["!cols"] = colWidths

    const xlsxFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`
    XLSX.writeFile(workbook, xlsxFilename)
}

// ---------------------------------------------------------------------------
// Convenience: flatten invoice-like objects for export
// ---------------------------------------------------------------------------

export type InvoiceExportRow = {
    "Invoice #": string
    Date: string
    Company: string
    Amount: string
    Status: string
    "AI Verdict": string
    "Risk Score": string
}

export function invoicesToExportRows(invoices: any[]): InvoiceExportRow[] {
    return invoices.map((inv) => ({
        "Invoice #": inv.invoiceNumber ?? inv.invoiceNo ?? "",
        Date: inv.invoiceDate ?? inv.date ?? inv.uploadedAt ?? inv.createdAt ?? "",
        Company: inv.companyName ?? "",
        Amount: inv.totalAmount ?? inv.amount ?? "",
        Status: inv.status ?? "",
        "AI Verdict": inv.aiVerdict?.verdict ?? "",
        "Risk Score": inv.aiVerdict?.riskScore ?? "",
    }))
}
