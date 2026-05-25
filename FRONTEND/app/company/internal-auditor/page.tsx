"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/global/use-auth"
import { useRouter } from "next/navigation"
import {
    AlertTriangle, CheckCircle2, Clock, Search, Filter,
    TrendingUp, FileWarning, ShieldCheck, ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_QUEUE_KEY = "finshield_simulated_audit_queue"

interface QueueInvoice {
    id: string
    invoiceNumber: string
    vendor: string
    amount: number
    submittedBy: string
    submittedAt: string
    flags: string[]
    riskScore: number
    status: "pending" | "verified" | "rejected"
}

const SEED_QUEUE: QueueInvoice[] = [
    {
        id: "qa-001", invoiceNumber: "INV-2024-0031", vendor: "Apex Supply Co.", amount: 148500,
        submittedBy: "m.reyes@finshield.ph", submittedAt: "2024-12-10T09:15:00Z",
        flags: ["Metadata Mismatch", "Duplicate Transaction Hash"], riskScore: 87, status: "pending"
    },
    {
        id: "qa-002", invoiceNumber: "INV-2024-0028", vendor: "GlobalTech Imports", amount: 62300,
        submittedBy: "j.santos@finshield.ph", submittedAt: "2024-12-09T14:02:00Z",
        flags: ["Amount Variance"], riskScore: 62, status: "pending"
    },
    {
        id: "qa-003", invoiceNumber: "INV-2024-0025", vendor: "Premier Logistics", amount: 320000,
        submittedBy: "a.cruz@finshield.ph", submittedAt: "2024-12-08T11:30:00Z",
        flags: ["Missing Invoice ID", "Supplier Not Whitelisted"], riskScore: 91, status: "pending"
    },
    {
        id: "qa-004", invoiceNumber: "INV-2024-0019", vendor: "DataCore Systems", amount: 28750,
        submittedBy: "l.garcia@finshield.ph", submittedAt: "2024-12-07T16:45:00Z",
        flags: ["Metadata Mismatch"], riskScore: 55, status: "verified"
    },
    {
        id: "qa-005", invoiceNumber: "INV-2024-0017", vendor: "NovaStar Trading", amount: 410000,
        submittedBy: "r.mendoza@finshield.ph", submittedAt: "2024-12-06T08:20:00Z",
        flags: ["Duplicate Transaction Hash", "Amount Variance", "Metadata Mismatch"], riskScore: 95, status: "rejected"
    },
    {
        id: "qa-006", invoiceNumber: "INV-2024-0014", vendor: "UrbanBuild Supplies", amount: 75900,
        submittedBy: "k.bautista@finshield.ph", submittedAt: "2024-12-05T13:10:00Z",
        flags: ["Amount Variance"], riskScore: 48, status: "pending"
    },
]

function getQueue(): QueueInvoice[] {
    if (typeof window === "undefined") return SEED_QUEUE
    try {
        const stored = localStorage.getItem(MOCK_QUEUE_KEY)
        return stored ? JSON.parse(stored) : SEED_QUEUE
    } catch { return SEED_QUEUE }
}

function formatPeso(v: number) {
    return "₱" + v.toLocaleString("en-PH", { minimumFractionDigits: 2 })
}

function timeAgo(dateStr: string) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
}

const riskColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50 border-red-200"
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-emerald-600 bg-emerald-50 border-emerald-200"
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
    pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700 border-amber-200" },
    verified: { label: "Verified", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    rejected: { label: "Rejected", icon: AlertTriangle, color: "bg-red-100 text-red-700 border-red-200" },
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InternalAuditorDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [queue, setQueue] = useState<QueueInvoice[]>([])
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified" | "rejected">("all")

    useEffect(() => {
        const q = getQueue()
        setQueue(q)
        localStorage.setItem(MOCK_QUEUE_KEY, JSON.stringify(q))
    }, [])

    const stats = useMemo(() => ({
        pending: queue.filter(i => i.status === "pending").length,
        verified: queue.filter(i => i.status === "verified").length,
        rejected: queue.filter(i => i.status === "rejected").length,
        highRisk: queue.filter(i => i.riskScore >= 80).length,
    }), [queue])

    const filtered = useMemo(() => {
        return queue.filter(inv => {
            const q = search.toLowerCase()
            const matchSearch = !q || inv.invoiceNumber.toLowerCase().includes(q) || inv.vendor.toLowerCase().includes(q)
            const matchStatus = statusFilter === "all" || inv.status === statusFilter
            return matchSearch && matchStatus
        })
    }, [queue, search, statusFilter])

    const statCards = [
        { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
        { label: "Verified", value: stats.verified, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        { label: "Rejected", value: stats.rejected, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
        { label: "High Risk (≥80%)", value: stats.highRisk, icon: FileWarning, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-normal tracking-tight">
                    Welcome back, <span className="text-primary">{user?.username || "Auditor"}</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                    Review flagged invoices and resolve pending audit items for your organization.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        className={cn("p-4 rounded-xl border bg-card shadow-sm flex items-center gap-4")}
                    >
                        <div className={cn("p-3 rounded-lg", card.bg)}>
                            <card.icon className={cn("h-5 w-5", card.color)} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Queue Table */}
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                {/* Table Header with Search + Filter */}
                <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center gap-2 flex-1">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                        <h3 className="font-semibold text-base">Verification Queue</h3>
                        <span className="text-xs text-muted-foreground ml-1">({filtered.length} items)</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search invoice or vendor…"
                                className="pl-8 h-9 text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-1">
                            {(["all", "pending", "verified", "rejected"] as const).map(s => (
                                <Button
                                    key={s}
                                    size="sm"
                                    variant={statusFilter === s ? "default" : "outline"}
                                    onClick={() => setStatusFilter(s)}
                                    className={cn("capitalize text-xs h-9 px-3", statusFilter === s && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600")}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground text-sm">
                            No invoices match your filter.
                        </div>
                    ) : (
                        filtered.map((inv, idx) => {
                            const sc = statusConfig[inv.status]
                            return (
                                <motion.div
                                    key={inv.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                                >
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="font-bold text-sm">{inv.invoiceNumber}</span>
                                            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", sc.color)}>
                                                <sc.icon className="inline h-3 w-3 mr-1" />
                                                {sc.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{inv.vendor}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{inv.submittedBy} · {timeAgo(inv.submittedAt)}</p>
                                    </div>

                                    {/* Flags */}
                                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                                        {inv.flags.map(f => (
                                            <span key={f} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                                                {f}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Amount + Risk */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatPeso(inv.amount)}</p>
                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", riskColor(inv.riskScore))}>
                                                {inv.riskScore}% Risk
                                            </span>
                                        </div>
                                        {inv.status === "pending" && (
                                            <Button
                                                size="sm"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                                                onClick={() => router.push(`/company/internal-auditor/verification?id=${inv.id}`)}
                                            >
                                                Review <ArrowRight className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
