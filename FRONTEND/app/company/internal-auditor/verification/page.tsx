"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
    AlertTriangle, CheckCircle2, XCircle, ArrowLeft,
    ShieldAlert, Brain, FileText, Fingerprint, Clock,
    User, Building2, DollarSign, Hash, Calendar, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { toast } from "sonner"

// ─── Types & Mock Data ────────────────────────────────────────────────────────
const MOCK_QUEUE_KEY = "finshield_simulated_audit_queue"
const AUDIT_RESOLUTIONS_KEY = "finshield_audit_resolutions"
const AUDIT_LOGS_KEY = "finshield_audit_logs"

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

interface AuditResolution {
    invoiceId: string
    action: "verified" | "rejected" | "escalated"
    reason: string
    auditorName: string
    timestamp: string
}

interface AuditLogEntry {
    id: string
    invoiceId: string
    invoiceNumber: string
    action: string
    auditorName: string
    timestamp: string
    reason: string
}

// Extended mock metadata for each invoice
const INVOICE_METADATA: Record<string, {
    purchaseOrder: string
    vendorId: string
    bankAccount: string
    expectedAmount: number
    invoiceDate: string
    dueDate: string
    lineItems: { description: string; qty: number; unit: number }[]
    aiVerdictDetail: string
    blockchainHash: string | null
    flags: { field: string; expected: string; actual: string; severity: "high" | "medium" | "low" }[]
}> = {
    "qa-001": {
        purchaseOrder: "PO-2024-0178", vendorId: "VND-4412", bankAccount: "•••• •••• 8823",
        expectedAmount: 145000, invoiceDate: "2024-12-08", dueDate: "2025-01-07",
        lineItems: [
            { description: "Industrial raw materials (Grade A)", qty: 50, unit: 2800 },
            { description: "Transport & handling fees", qty: 1, unit: 5500 },
        ],
        aiVerdictDetail: "High probability of duplicate transaction: hash matches INV-2024-0021. Supplier account number changed since last verified transaction.",
        blockchainHash: null,
        flags: [
            { field: "Amount", expected: "₱145,000.00", actual: "₱148,500.00", severity: "medium" },
            { field: "Supplier Account", expected: "•••• •••• 7201", actual: "•••• •••• 8823", severity: "high" },
            { field: "Transaction Hash", expected: "Unique", actual: "Duplicate of INV-2024-0021", severity: "high" },
        ]
    },
    "qa-002": {
        purchaseOrder: "PO-2024-0165", vendorId: "VND-3309", bankAccount: "•••• •••• 5544",
        expectedAmount: 58000, invoiceDate: "2024-12-07", dueDate: "2025-01-06",
        lineItems: [
            { description: "Server rack components", qty: 10, unit: 6230 },
        ],
        aiVerdictDetail: "Minor amount variance detected (7.4% above expected PO value). Vendor verified but amount discrepancy exceeds tolerance threshold.",
        blockchainHash: "0x3fa...b8c2",
        flags: [
            { field: "Total Amount", expected: "₱58,000.00", actual: "₱62,300.00", severity: "medium" },
        ]
    },
    "qa-003": {
        purchaseOrder: "PO-2024-0152", vendorId: "VND-UNLISTED", bankAccount: "•••• •••• 9910",
        expectedAmount: 320000, invoiceDate: "2024-12-06", dueDate: "2025-01-05",
        lineItems: [
            { description: "Freight logistics (air)", qty: 1, unit: 200000 },
            { description: "Customs clearance", qty: 1, unit: 80000 },
            { description: "Last-mile delivery", qty: 1, unit: 40000 },
        ],
        aiVerdictDetail: "Critical: Invoice ID is blank/unreadable. Vendor ID 'VND-UNLISTED' does not match any approved supplier list. Immediate escalation recommended.",
        blockchainHash: null,
        flags: [
            { field: "Invoice ID", expected: "Valid unique ID", actual: "Missing / Unreadable", severity: "high" },
            { field: "Vendor ID", expected: "Whitelisted supplier", actual: "VND-UNLISTED (not approved)", severity: "high" },
        ]
    },
    "qa-006": {
        purchaseOrder: "PO-2024-0139", vendorId: "VND-2207", bankAccount: "•••• •••• 3312",
        expectedAmount: 72000, invoiceDate: "2024-12-03", dueDate: "2025-01-02",
        lineItems: [
            { description: "Construction materials (Cement bags)", qty: 300, unit: 250 },
            { description: "Steel rebar (20mm)", qty: 15, unit: 490 },
        ],
        aiVerdictDetail: "Amount variance of 5.4% detected. Within borderline tolerance. Vendor is whitelisted. Manual review recommended given amount.",
        blockchainHash: "0x9cd...44f1",
        flags: [
            { field: "Total Amount", expected: "₱72,000.00", actual: "₱75,900.00", severity: "low" },
        ]
    }
}

function getQueue(): QueueInvoice[] {
    if (typeof window === "undefined") return []
    try {
        const s = localStorage.getItem(MOCK_QUEUE_KEY)
        return s ? JSON.parse(s) : []
    } catch { return [] }
}

function formatPeso(v: number) {
    return "₱" + v.toLocaleString("en-PH", { minimumFractionDigits: 2 })
}

function severityBadge(s: "high" | "medium" | "low") {
    return s === "high"
        ? "bg-red-100 text-red-700 border-red-300"
        : s === "medium"
        ? "bg-amber-100 text-amber-700 border-amber-300"
        : "bg-sky-100 text-sky-700 border-sky-300"
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VerificationWorkspace() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const id = searchParams.get("id")

    const [invoice, setInvoice] = useState<QueueInvoice | null>(null)
    const [reason, setReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [resolved, setResolved] = useState(false)
    const [resolvedAction, setResolvedAction] = useState<"verified" | "rejected" | "escalated" | null>(null)

    useEffect(() => {
        if (!id) return
        const q = getQueue()
        const found = q.find(i => i.id === id)
        setInvoice(found || null)
    }, [id])

    const meta = invoice ? (INVOICE_METADATA[invoice.id] || null) : null

    function resolve(action: "verified" | "rejected" | "escalated") {
        if (!invoice) return
        setIsSubmitting(true)

        setTimeout(() => {
            // Update queue status
            const q = getQueue()
            const updated = q.map(i =>
                i.id === invoice.id
                    ? { ...i, status: action === "escalated" ? "pending" : action } as QueueInvoice
                    : i
            )
            localStorage.setItem(MOCK_QUEUE_KEY, JSON.stringify(updated))

            // Save resolution
            const resolution: AuditResolution = {
                invoiceId: invoice.id,
                action,
                reason: reason.trim() || "No reason provided.",
                auditorName: "Current Auditor",
                timestamp: new Date().toISOString(),
            }
            const existing = JSON.parse(localStorage.getItem(AUDIT_RESOLUTIONS_KEY) || "[]")
            localStorage.setItem(AUDIT_RESOLUTIONS_KEY, JSON.stringify([resolution, ...existing]))

            // Save to audit log
            const logEntry: AuditLogEntry = {
                id: `log-${Date.now()}`,
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                action: action === "verified" ? "INVOICE_VERIFIED" : action === "rejected" ? "INVOICE_REJECTED" : "INVOICE_ESCALATED",
                auditorName: "Current Auditor",
                timestamp: new Date().toISOString(),
                reason: reason.trim() || "No reason provided.",
            }
            const existingLogs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]")
            localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([logEntry, ...existingLogs]))

            setIsSubmitting(false)
            setResolved(true)
            setResolvedAction(action)

            const label = action === "verified" ? "verified" : action === "rejected" ? "rejected" : "escalated"
            toast.success(`Invoice ${invoice.invoiceNumber} has been ${label}.`)
        }, 900)
    }

    // ─── No invoice selected ──────────────────────────────────────────────────
    if (!id || !invoice) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <FileText className="h-12 w-12 text-muted-foreground opacity-40" />
                <h2 className="text-lg font-semibold">No Invoice Selected</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Select a pending invoice from the verification queue to begin the audit process.
                </p>
                <Button onClick={() => router.push("/company/internal-auditor")} variant="outline" className="gap-2 mt-2">
                    <ArrowLeft className="h-4 w-4" /> Go to Queue
                </Button>
            </div>
        )
    }

    // ─── Resolved state ───────────────────────────────────────────────────────
    if (resolved) {
        const icon = resolvedAction === "verified" ? CheckCircle2 : resolvedAction === "rejected" ? XCircle : AlertTriangle
        const color = resolvedAction === "verified" ? "text-emerald-500" : resolvedAction === "rejected" ? "text-red-500" : "text-amber-500"
        const label = resolvedAction === "verified" ? "Invoice Verified" : resolvedAction === "rejected" ? "Invoice Rejected" : "Invoice Escalated"

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center gap-5"
            >
                {(() => { const Icon = icon; return <Icon className={cn("h-16 w-16", color)} /> })()}
                <h2 className="text-xl font-bold">{label}</h2>
                <p className="text-sm text-muted-foreground">
                    {invoice.invoiceNumber} has been {resolvedAction}. The audit log has been updated.
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => router.push("/company/internal-auditor")} variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Queue
                    </Button>
                    <Button onClick={() => router.push("/company/internal-auditor/audit-logs")} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        View Audit Logs <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </motion.div>
        )
    }

    // ─── Main split-pane workspace ────────────────────────────────────────────
    return (
        <div className="space-y-4">
            {/* Back breadcrumb */}
            <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => router.push("/company/internal-auditor")} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
                    <ArrowLeft className="h-4 w-4" /> Queue
                </Button>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{invoice.invoiceNumber}</span>
                <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Pending Audit
                </span>
            </div>

            {/* Split pane */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* ── Left: Invoice Document & Mismatch Panel ── */}
                <div className="xl:col-span-3 space-y-4">
                    {/* Document Header */}
                    <div className="border rounded-xl bg-card shadow-sm p-5 space-y-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h3 className="text-lg font-bold">{invoice.invoiceNumber}</h3>
                                <p className="text-sm text-muted-foreground">{invoice.vendor}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold">{formatPeso(invoice.amount)}</p>
                                <p className="text-xs text-muted-foreground">Invoice Total</p>
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { icon: Building2, label: "Vendor", value: invoice.vendor },
                                { icon: Hash, label: "PO Number", value: meta?.purchaseOrder || "—" },
                                { icon: Fingerprint, label: "Vendor ID", value: meta?.vendorId || "—" },
                                { icon: DollarSign, label: "Expected Amount", value: formatPeso(meta?.expectedAmount || 0) },
                                { icon: Calendar, label: "Invoice Date", value: meta?.invoiceDate || "—" },
                                { icon: Calendar, label: "Due Date", value: meta?.dueDate || "—" },
                                { icon: User, label: "Submitted By", value: invoice.submittedBy },
                                { icon: Hash, label: "Bank Account", value: meta?.bankAccount || "—" },
                                {
                                    icon: Fingerprint, label: "Blockchain Hash",
                                    value: meta?.blockchainHash || "Not anchored"
                                },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-2.5">
                                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                                        <p className="text-sm font-medium truncate" title={value}>{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Line Items (Invoice mock document) */}
                    {meta?.lineItems && (
                        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-semibold">Line Items</h4>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left px-5 py-2.5 text-muted-foreground font-medium text-xs">Description</th>
                                        <th className="text-right px-5 py-2.5 text-muted-foreground font-medium text-xs">Qty</th>
                                        <th className="text-right px-5 py-2.5 text-muted-foreground font-medium text-xs">Unit Price</th>
                                        <th className="text-right px-5 py-2.5 text-muted-foreground font-medium text-xs">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meta.lineItems.map((item, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="px-5 py-3">{item.description}</td>
                                            <td className="px-5 py-3 text-right">{item.qty}</td>
                                            <td className="px-5 py-3 text-right">{formatPeso(item.unit)}</td>
                                            <td className="px-5 py-3 text-right font-semibold">{formatPeso(item.qty * item.unit)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-muted/20">
                                        <td colSpan={3} className="px-5 py-3 font-bold text-right">Total Invoiced</td>
                                        <td className="px-5 py-3 font-bold text-right text-base">{formatPeso(invoice.amount)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Metadata Mismatch Flags */}
                    {meta?.flags && meta.flags.length > 0 && (
                        <div className="border border-red-200 rounded-xl bg-red-50/50 dark:bg-red-950/10 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 border-b border-red-200 bg-red-100/50 dark:bg-red-950/20 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <h4 className="text-sm font-semibold text-red-700">Metadata Mismatches</h4>
                                <span className="ml-auto text-xs text-red-500 font-medium">{meta.flags.length} flag{meta.flags.length !== 1 ? "s" : ""} detected</span>
                            </div>
                            <div className="divide-y divide-red-100 dark:divide-red-900">
                                {meta.flags.map((flag, i) => (
                                    <div key={i} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold">{flag.field}</span>
                                                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", severityBadge(flag.severity))}>
                                                    {flag.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-xs">
                                                <div>
                                                    <p className="text-muted-foreground mb-0.5">Expected</p>
                                                    <p className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">{flag.expected}</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground mb-0.5">Actual</p>
                                                    <p className="font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">{flag.actual}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Right: AI Verdict + Action Panel ── */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Risk Score */}
                    <div className="border rounded-xl bg-card shadow-sm p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-primary" />
                            <h4 className="font-semibold">Risk Assessment</h4>
                        </div>
                        <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${invoice.riskScore}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={cn("h-full rounded-full", invoice.riskScore >= 80 ? "bg-red-500" : invoice.riskScore >= 60 ? "bg-amber-500" : "bg-emerald-500")}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Low</span>
                            <span className={cn("font-bold text-base", invoice.riskScore >= 80 ? "text-red-600" : invoice.riskScore >= 60 ? "text-amber-600" : "text-emerald-600")}>
                                {invoice.riskScore}%
                            </span>
                            <span>Critical</span>
                        </div>
                    </div>

                    {/* AI Verdict */}
                    <div className="border rounded-xl bg-card shadow-sm p-5 space-y-3">
                        <div className="flex items-center gap-2">
                            <Brain className="h-5 w-5 text-violet-500" />
                            <h4 className="font-semibold">AI Verdict</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {invoice.flags.map(f => (
                                <span key={f} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">
                                    {f}
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {meta?.aiVerdictDetail || "AI analysis detected anomalies requiring manual verification."}
                        </p>
                        {meta?.blockchainHash === null && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                Not yet anchored to blockchain ledger
                            </div>
                        )}
                    </div>

                    {/* Resolution Action Panel */}
                    <div className="border rounded-xl bg-card shadow-sm p-5 space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                            Audit Decision
                        </h4>
                        <div>
                            <Label htmlFor="reason" className="text-sm font-medium">Resolution Notes</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter reasoning or observations before submitting your decision…"
                                className="mt-1.5 resize-none text-sm"
                                rows={4}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1.5">
                                Notes are stored in the audit log and cannot be edited after submission.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            <Button
                                disabled={isSubmitting}
                                onClick={() => resolve("verified")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-10"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Verify Invoice
                            </Button>
                            <Button
                                disabled={isSubmitting}
                                onClick={() => resolve("rejected")}
                                variant="destructive"
                                className="gap-2 h-10"
                            >
                                <XCircle className="h-4 w-4" />
                                Reject Invoice
                            </Button>
                            <Button
                                disabled={isSubmitting}
                                onClick={() => resolve("escalated")}
                                variant="outline"
                                className="gap-2 h-10 border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                Escalate to Superadmin
                            </Button>
                        </div>

                        {isSubmitting && (
                            <p className="text-xs text-muted-foreground text-center animate-pulse">Processing decision…</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
