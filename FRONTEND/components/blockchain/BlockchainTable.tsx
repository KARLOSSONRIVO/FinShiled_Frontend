"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { LedgerInvoice } from "@/lib/types"
import { Check, ChevronUp, ChevronDown, Copy } from "lucide-react"

interface BlockchainTableProps {
    invoices: LedgerInvoice[]
    sortBy?: string
    order?: "asc" | "desc"
    onSort?: (field: string) => void
}

export function BlockchainTable({ invoices, sortBy, order, onSort }: BlockchainTableProps) {
    const [copiedHash, setCopiedHash] = useState<string | null>(null)

    const copyTransactionHash = async (transactionHash: string) => {
        await navigator.clipboard.writeText(transactionHash)
        setCopiedHash(transactionHash)
        window.setTimeout(() => setCopiedHash(null), 2000)
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm px-3 py-2 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="px-6 py-4 text-center">
                            <div
                                className="flex items-center justify-center gap-2 cursor-pointer font-bold text-base text-foreground"
                            >
                                Invoice No.
                            </div>
                        </TableHead>
                        <TableHead className="px-6 py-4 text-foreground font-bold text-base text-center">Company</TableHead>
                        <TableHead className="px-6 py-4 text-foreground font-bold text-base text-center">Transaction Hash</TableHead>
                        <TableHead className="px-6 py-4 text-center">
                            <div
                                className="flex items-center justify-center gap-2 cursor-pointer font-bold text-base text-foreground"
                                onClick={() => onSort?.("anchoredAt")}
                            >
                                Anchored At
                                {sortBy === 'anchoredAt' ? (order === 'asc' ? <ChevronUp className="h-4 w-4 text-primary" /> : <ChevronDown className="h-4 w-4 text-primary" />) : <ChevronUp className="h-4 w-4 text-muted-foreground/40" />}
                            </div>
                        </TableHead>
                        <TableHead className="px-6 py-4 text-foreground font-bold text-base text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No anchored invoices found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        invoices.map((row) => (
                            <TableRow key={row.id || (row as any)._id} className="h-20 hover:bg-muted/30 transition-colors border-b border-border/50">
                                <TableCell className="px-6 text-center font-bold text-base text-foreground">
                                    {!row.invoiceNumber || String(row.invoiceNumber).trim().toLowerCase() === 'n/a' || String(row.invoiceNumber).trim() === '—' ? 'Invalid Number' : row.invoiceNumber}
                                </TableCell>
                                <TableCell className="px-6 text-center font-bold text-base text-foreground">
                                    {row.company || '—'}
                                </TableCell>
                                <TableCell className="px-6 text-sm text-muted-foreground">
                                    {row.transactionHash ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="block max-w-[220px] truncate" title={row.transactionHash}>
                                                {row.transactionHash}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyTransactionHash(row.transactionHash)}
                                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                aria-label={copiedHash === row.transactionHash ? "Transaction hash copied" : "Copy transaction hash"}
                                                title={copiedHash === row.transactionHash ? "Copied!" : "Copy transaction hash"}
                                            >
                                                {copiedHash === row.transactionHash ? (
                                                    <Check className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="block text-center">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="px-6 text-center font-bold text-base text-foreground">
                                    {row.anchoredAt ? new Date(row.anchoredAt).toLocaleString() : "—"}
                                </TableCell>
                                <TableCell className="px-6 text-center">
                                    <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-[10px] font-bold inline-block min-w-[80px] uppercase tracking-wider">
                                        {row.status || "Anchored"}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div >
    )
}
