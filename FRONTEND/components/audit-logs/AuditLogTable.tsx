"use client"

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { AuditLog } from "@/lib/types"
import { cn } from "@/lib/utils"

interface AuditLogTableProps {
    logs: AuditLog[]
    sortConfig?: { key: string; direction: "asc" | "desc" } | null
    requestSort?: (key: string) => void
    onSelectLog?: (log: AuditLog) => void
}

export function AuditLogTable({ logs, sortConfig, requestSort, onSelectLog }: AuditLogTableProps) {
    const renderSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        return sortConfig.direction === "asc"
            ? <ChevronUp className="ml-2 h-4 w-4 text-emerald-600" />
            : <ChevronDown className="ml-2 h-4 w-4 text-emerald-600" />
    }

    const SortableHeader = ({ label, sortKey, className }: { label: string; sortKey?: string; className?: string }) => (
        <TableHead className={cn("px-6 py-4 text-base font-bold text-foreground whitespace-nowrap", className)}>
            {sortKey && requestSort ? (
                <button
                    type="button"
                    className="flex items-center rounded-sm transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                    onClick={() => requestSort(sortKey)}
                >
                    {label}
                    {renderSortIcon(sortKey)}
                </button>
            ) : label}
        </TableHead>
    )

    return (
        <div className="overflow-x-auto rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                        <SortableHeader label="Timestamp" sortKey="createdAt" />
                        <SortableHeader label="Actor" />
                        <SortableHeader label="Action" className="text-center" />
                        <SortableHeader label="Target Type" className="text-center" />
                        <SortableHeader label="IP Address" />
                        <SortableHeader label="Location" />
                        <SortableHeader label="Summary" className="w-full" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-32 text-center">
                                <p className="font-medium text-foreground">No audit events found</p>
                                <p className="mt-1 text-sm text-muted-foreground">Adjust the search or filters to see more events.</p>
                            </TableCell>
                        </TableRow>
                    ) : logs.map((row) => (
                        <TableRow
                            key={row.id}
                            role={onSelectLog ? "button" : undefined}
                            tabIndex={onSelectLog ? 0 : undefined}
                            aria-label={onSelectLog ? `View details for ${String(row.action).replace(/_/g, " ")}` : undefined}
                            className={cn(
                                "h-20 border-b border-border/50 transition-colors hover:bg-muted/30",
                                onSelectLog && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600",
                            )}
                            onClick={() => onSelectLog?.(row)}
                            onKeyDown={(event) => {
                                if (onSelectLog && (event.key === "Enter" || event.key === " ")) {
                                    event.preventDefault()
                                    onSelectLog(row)
                                }
                            }}
                        >
                            <TableCell className="px-6 whitespace-nowrap text-base font-bold text-foreground">
                                {new Date(row.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="px-6 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold uppercase text-foreground">
                                        {row.actorRole?.replace(/_/g, " ") || "Unknown actor"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{row.actor?.email || "Email unavailable"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 text-center whitespace-nowrap">
                                <span className="inline-block rounded-md bg-emerald-800 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                                    {String(row.action).replace(/_/g, " ")}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 text-center whitespace-nowrap">
                                <span className="inline-block rounded-md border border-emerald-200 bg-emerald-600/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                                    {row.targetType || "—"}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 font-mono text-sm text-foreground whitespace-nowrap">
                                {row.ipAddress || row.ip || "—"}
                            </TableCell>
                            <TableCell
                                className="max-w-[240px] truncate px-6 text-sm text-foreground"
                                title={row.location?.display || "Location unavailable"}
                            >
                                {row.location?.display || "Location unavailable"}
                            </TableCell>
                            <TableCell className="w-full max-w-sm px-6 text-sm text-foreground">
                                <div className="line-clamp-2 whitespace-normal break-words" title={row.summary}>
                                    {row.summary}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
