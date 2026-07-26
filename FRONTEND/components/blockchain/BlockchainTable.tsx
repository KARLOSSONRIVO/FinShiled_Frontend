"use client"

import { useState } from "react"
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react"
import type { BlockchainTransaction } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BlockchainTableProps {
  invoices: BlockchainTransaction[]
  sortBy?: string
  order?: "asc" | "desc"
  onSort?: (field: string) => void
}

export function BlockchainTable({ invoices, sortBy, order, onSort }: BlockchainTableProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    window.setTimeout(() => setCopiedHash(null), 2000)
  }

  return <div className="overflow-x-auto rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
    <Table>
      <TableHeader><TableRow>
        <TableHead className="px-6 py-4 text-center font-bold">Invoice Reference</TableHead>
        <TableHead className="px-6 py-4 text-center font-bold">Organization</TableHead>
        <TableHead className="px-6 py-4 text-center font-bold">Transaction Hash</TableHead>
        <TableHead className="px-6 py-4 text-center font-bold">Block / Network</TableHead>
        <TableHead className="px-6 py-4 text-center"><button type="button" className="mx-auto flex items-center gap-2 font-bold" onClick={() => onSort?.("anchoredAt")}>Confirmed {sortBy === "anchoredAt" ? order === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" /> : null}</button></TableHead>
        <TableHead className="px-6 py-4 text-center font-bold">Status</TableHead>
      </TableRow></TableHeader>
      <TableBody>
        {invoices.length === 0 ? <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">No Blockchain Transactions found.</TableCell></TableRow> : invoices.map(row => <TableRow key={row.id || row._id} className="h-20">
          <TableCell className="px-6 text-center font-semibold">{row.invoiceReference && row.invoiceReference.toLowerCase() !== "n/a" ? row.invoiceReference : "Invalid Number"}</TableCell>
          <TableCell className="px-6 text-center">{row.organization || row.company || "—"}</TableCell>
          <TableCell className="px-6 text-sm"><div className="flex items-center justify-center gap-2"><span className="max-w-[220px] truncate" title={row.transactionHash}>{row.transactionHash || "—"}</span>{row.transactionHash && <button type="button" onClick={() => copyHash(row.transactionHash)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border" aria-label={copiedHash === row.transactionHash ? "Transaction hash copied" : "Copy transaction hash"}>{copiedHash === row.transactionHash ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</button>}</div></TableCell>
          <TableCell className="px-6 text-center text-sm"><div>{row.blockNumber ?? "Pending"}</div><div className="text-muted-foreground">{row.network || "—"}</div></TableCell>
          <TableCell className="px-6 text-center text-sm">{row.confirmedDate || row.anchoredAt ? new Date(row.confirmedDate || row.anchoredAt).toLocaleString() : "—"}</TableCell>
          <TableCell className="px-6 text-center"><span className="inline-block min-w-20 rounded-md bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">{row.transactionStatus || row.status || "Pending"}</span>{row.technical?.errorCode && <div className="mt-2 text-xs text-red-700">{row.technical.errorCode}</div>}</TableCell>
        </TableRow>)}
      </TableBody>
    </Table>
  </div>
}
