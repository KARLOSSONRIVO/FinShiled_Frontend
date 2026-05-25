"use client"

import { useState, useEffect, useMemo } from "react"
import { ScrollText, Search, Download, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const AUDIT_LOGS_KEY = "finshield_audit_logs"

interface AuditLogEntry {
    id: string
    invoiceId: string
    invoiceNumber: string
    action: string
    auditorName: string
    timestamp: string
    reason: string
}

// Seed with some pre-existing log entries
const SEED_LOGS: AuditLogEntry[] = [
    {
        id: "log-seed-001", invoiceId: "qa-004", invoiceNumber: "INV-2024-0019",
        action: "INVOICE_VERIFIED", auditorName: "M. Reyes", timestamp: "2024-12-07T17:00:00Z",
        reason: "Metadata mismatch reviewed and confirmed as minor data entry discrepancy. Supplier contacted and confirmed correct."
    },
    {
        id: "log-seed-002", invoiceId: "qa-005", invoiceNumber: "INV-2024-0017",
        action: "INVOICE_REJECTED", auditorName: "J. Santos", timestamp: "2024-12-06T09:30:00Z",
        reason: "Duplicate transaction hash and amount variance too high. Invoice returned to vendor for correction."
    },
    {
        id: "log-seed-003", invoiceId: "qa-007", invoiceNumber: "INV-2024-0012",
        action: "INVOICE_VERIFIED", auditorName: "M. Reyes", timestamp: "2024-12-04T14:20:00Z",
        reason: "Clean invoice. All metadata verified against PO-2024-0140."
    },
    {
        id: "log-seed-004", invoiceId: "qa-008", invoiceNumber: "INV-2024-0009",
        action: "INVOICE_ESCALATED", auditorName: "K. Bautista", timestamp: "2024-12-03T10:50:00Z",
        reason: "Requires superadmin review due to large amount and unresolved vendor query."
    },
]

function getLogs(): AuditLogEntry[] {
    if (typeof window === "undefined") return SEED_LOGS
    try {
        const stored = localStorage.getItem(AUDIT_LOGS_KEY)
        if (stored) {
            const parsed: AuditLogEntry[] = JSON.parse(stored)
            // Merge seeds that aren't already in stored
            const storedIds = new Set(parsed.map(l => l.id))
            const missing = SEED_LOGS.filter(s => !storedIds.has(s.id))
            return [...parsed, ...missing]
        }
        return SEED_LOGS
    } catch { return SEED_LOGS }
}

function formatDate(d: string) {
    return new Date(d).toLocaleString("en-PH", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    })
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
    "INVOICE_VERIFIED": { label: "Verified", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200" },
    "INVOICE_REJECTED": { label: "Rejected", icon: XCircle, color: "text-red-700", bg: "bg-red-100 border-red-200" },
    "INVOICE_ESCALATED": { label: "Escalated", icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-100 border-amber-200" },
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [search, setSearch] = useState("")
    const [actionFilter, setActionFilter] = useState<"all" | "INVOICE_VERIFIED" | "INVOICE_REJECTED" | "INVOICE_ESCALATED">("all")

    const load = () => {
        const l = getLogs()
        // Sort newest first
        l.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setLogs(l)
        localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(l))
    }

    useEffect(() => { load() }, [])

    const filtered = useMemo(() => {
        return logs.filter(l => {
            const q = search.toLowerCase()
            const matchSearch = !q || l.invoiceNumber.toLowerCase().includes(q) || l.auditorName.toLowerCase().includes(q) || l.reason.toLowerCase().includes(q)
            const matchAction = actionFilter === "all" || l.action === actionFilter
            return matchSearch && matchAction
        })
    }, [logs, search, actionFilter])

    function downloadCSV() {
        const headers = ["Timestamp", "Invoice Number", "Action", "Auditor", "Notes"]
        const rows = filtered.map(l => [
            formatDate(l.timestamp), l.invoiceNumber, l.action.replace(/_/g, " "), l.auditorName, `"${l.reason.replace(/"/g, '""')}"`
        ])
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `audit-logs-${Date.now()}.csv`
        a.click()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div>
                    <h2 className="text-2xl font-normal tracking-tight">Audit Logs</h2>
                    <p className="text-sm text-muted-foreground">
                        Chronological record of all audit decisions made by your team.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5" /> Refresh
                    </Button>
                    <Button size="sm" onClick={downloadCSV} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search invoice, auditor, or notes…"
                        className="pl-8 h-9 text-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5">
                    {([
                        { value: "all", label: "All" },
                        { value: "INVOICE_VERIFIED", label: "Verified" },
                        { value: "INVOICE_REJECTED", label: "Rejected" },
                        { value: "INVOICE_ESCALATED", label: "Escalated" },
                    ] as const).map(opt => (
                        <Button
                            key={opt.value}
                            size="sm"
                            variant={actionFilter === opt.value ? "default" : "outline"}
                            onClick={() => setActionFilter(opt.value)}
                            className={cn("text-xs h-9 px-3", actionFilter === opt.value && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600")}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Count */}
            <p className="text-xs text-muted-foreground -mt-2">{filtered.length} log entr{filtered.length === 1 ? "y" : "ies"}</p>

            {/* Timeline log entries */}
            <div className="relative space-y-0">
                {/* Vertical timeline line */}
                <div className="absolute left-[1.15rem] top-0 bottom-0 w-px bg-border" />

                {filtered.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground text-sm">
                        No audit log entries match your filter.
                    </div>
                ) : (
                    filtered.map((log, idx) => {
                        const config = ACTION_CONFIG[log.action] || {
                            label: log.action.replace(/_/g, " "),
                            icon: Clock,
                            color: "text-muted-foreground",
                            bg: "bg-muted border-border"
                        }
                        const Icon = config.icon

                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="relative pl-10 pb-6 last:pb-0"
                            >
                                {/* Timeline dot */}
                                <div className={cn("absolute left-0 top-1 h-[1.6rem] w-[1.6rem] rounded-full border-2 flex items-center justify-center bg-background z-10", config.bg.split(" ").find(c => c.startsWith("border")))}>
                                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                                </div>

                                {/* Card */}
                                <div className="border rounded-xl bg-card shadow-sm p-4 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{log.invoiceNumber}</span>
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", config.bg, config.color)}>
                                                {config.label}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{formatDate(log.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">{log.auditorName}</span>
                                        {" — "}{log.reason}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
