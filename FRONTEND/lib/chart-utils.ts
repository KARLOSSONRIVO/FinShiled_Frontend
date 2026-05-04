// ─── Types ───────────────────────────────────────────────────────────────────

export type Period = "weekly" | "monthly"

export type RiskGraphPoint = {
    label: string   // "Week 1" | "Jan" etc.
    clean: number   // clean/approved invoice count in period
    flagged: number // flagged/rejected invoice count in period
    risk: number    // avg aiVerdict.riskScore in period, clamped 0–100
}

export type ApprovalPoint = {
    name: "Accepted" | "Rejected" | "Pending"
    value: number
    color: string
}

export type GroupedRow = {
    name: string    // companyName | uploadedByName
    total: number
    clean: number
    flagged: number
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

type InvoiceBase = {
    uploadedAt?: string
    createdAt?: string
    status?: string
    reviewDecision?: string
    aiVerdict?: { verdict?: string; riskScore?: number }
    amount?: number
    totalAmount?: number
    [key: string]: any
}

function getDate(inv: InvoiceBase): Date | null {
    const raw = inv.uploadedAt ?? inv.createdAt
    if (!raw) return null
    const d = new Date(raw)
    return isNaN(d.getTime()) ? null : d
}

function isClean(inv: InvoiceBase): boolean {
    const status = String(inv.status ?? "").toLowerCase()
    const decision = String(inv.reviewDecision ?? "").toLowerCase()
    const verdict = String(inv.aiVerdict?.verdict ?? "").toLowerCase()
    return (
        status === "clean" ||
        status === "approved" ||
        status === "accepted" ||
        status === "anchored" ||
        decision === "approved" ||
        verdict === "clean"
    )
}

function isFlagged(inv: InvoiceBase): boolean {
    const status = String(inv.status ?? "").toLowerCase()
    const decision = String(inv.reviewDecision ?? "").toLowerCase()
    const verdict = String(inv.aiVerdict?.verdict ?? "").toLowerCase()
    return (
        status === "flagged" ||
        status === "rejected" ||
        decision === "rejected" ||
        verdict === "flagged"
    )
}

// ─── groupInvoicesByPeriod ────────────────────────────────────────────────────
// Weekly:  4 buckets — last 28 days, each 7 days, labeled "Week 1"…"Week 4"
// Monthly: 6 buckets — last 6 calendar months, labeled "Jan"…"Dec"

export function groupInvoicesByPeriod(
    invoices: InvoiceBase[],
    period: Period
): RiskGraphPoint[] {
    const now = new Date()

    if (period === "weekly") {
        const buckets: RiskGraphPoint[] = Array.from({ length: 4 }, (_, i) => ({
            label: `Week ${i + 1}`,
            clean: 0,
            flagged: 0,
            risk: 0,
        }))
        const riskSums = [0, 0, 0, 0]
        const riskCounts = [0, 0, 0, 0]

        for (const inv of invoices) {
            const d = getDate(inv)
            if (!d) continue
            const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
            if (daysAgo < 0 || daysAgo >= 28) continue
            // Week 1 = oldest (21–27 days ago), Week 4 = most recent (0–6 days ago)
            const bucketIndex = 3 - Math.floor(daysAgo / 7)
            if (isClean(inv)) buckets[bucketIndex].clean++
            else if (isFlagged(inv)) buckets[bucketIndex].flagged++
            const score = inv.aiVerdict?.riskScore
            if (typeof score === "number" && !isNaN(score)) {
                riskSums[bucketIndex] += score
                riskCounts[bucketIndex]++
            }
        }

        return buckets.map((b, i) => ({
            ...b,
            risk: riskCounts[i] > 0
                ? Math.min(100, Math.round(riskSums[i] / riskCounts[i]))
                : 0,
        }))
    }

    // Monthly
    const months: RiskGraphPoint[] = []
    const riskSums: number[] = []
    const riskCounts: number[] = []

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push({
            label: d.toLocaleString("default", { month: "short" }),
            clean: 0,
            flagged: 0,
            risk: 0,
        })
        riskSums.push(0)
        riskCounts.push(0)
    }

    for (const inv of invoices) {
        const d = getDate(inv)
        if (!d) continue
        for (let i = 0; i < 6; i++) {
            const target = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
            if (
                d.getFullYear() === target.getFullYear() &&
                d.getMonth() === target.getMonth()
            ) {
                if (isClean(inv)) months[i].clean++
                else if (isFlagged(inv)) months[i].flagged++
                const score = inv.aiVerdict?.riskScore
                if (typeof score === "number" && !isNaN(score)) {
                    riskSums[i] += score
                    riskCounts[i]++
                }
                break
            }
        }
    }

    return months.map((m, i) => ({
        ...m,
        risk: riskCounts[i] > 0
            ? Math.min(100, Math.round(riskSums[i] / riskCounts[i]))
            : 0,
    }))
}

// ─── computeApprovalRate ──────────────────────────────────────────────────────
// Flat counts from entire invoice array — period-agnostic (current state)

export function computeApprovalRate(invoices: InvoiceBase[]): ApprovalPoint[] {
    let accepted = 0
    let rejected = 0
    let pending = 0

    for (const inv of invoices) {
        if (isClean(inv)) accepted++
        else if (isFlagged(inv)) rejected++
        else pending++
    }

    return [
        { name: "Accepted", value: accepted, color: "#10b981" },
        { name: "Rejected", value: rejected, color: "#ef4444" },
        { name: "Pending",  value: pending,  color: "#f59e0b" },
    ]
}

// ─── groupInvoicesByKey ───────────────────────────────────────────────────────
// Groups invoices by a string field (e.g. "companyName", "uploadedByName").
// Returns rows sorted by total descending.

export function groupInvoicesByKey(
    invoices: InvoiceBase[],
    key: string
): GroupedRow[] {
    const map = new Map<string, GroupedRow>()

    for (const inv of invoices) {
        const name: string = inv[key] || "Unknown"
        if (!map.has(name)) {
            map.set(name, { name, total: 0, clean: 0, flagged: 0 })
        }
        const row = map.get(name)!
        row.total++
        if (isClean(inv)) row.clean++
        else if (isFlagged(inv)) row.flagged++
    }

    return Array.from(map.values()).sort((a, b) => b.total - a.total)
}
