// --- Types -------------------------------------------------------------------

export type Period = "weekly" | "monthly" | "yearly"

export type RiskGraphPoint = {
    label: string   // "Week 1" | "Jan" etc.
    clean: number   // clean/approved invoice count in period
    flagged: number // flagged/rejected invoice count in period
    risk: number    // avg aiVerdict.riskScore in period, clamped 0-100
}

export type ApprovalPoint = {
    name: "Accepted" | "Rejected" | "Pending"
    value: number
    color: string
}

export type GroupedRow = {
    name: string    // companyName | uploadedByUserId (user ID)
    total: number
    clean: number
    flagged: number
}

// --- Shared helpers -----------------------------------------------------------

type InvoiceBase = {
    uploadedAt?: string
    createdAt?: string
    invoiceDate?: string
    date?: string
    status?: string
    reviewDecision?: string
    aiVerdict?: { verdict?: string; riskScore?: number }
    amount?: number
    totalAmount?: number
    [key: string]: any
}

function getDate(inv: InvoiceBase): Date | null {
    // Mirror the fallback chain used across existing hooks
    const raw = inv.uploadedAt ?? inv.createdAt ?? inv.invoiceDate ?? inv.date
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

// --- groupInvoicesByPeriod ------------------------------
export function groupInvoicesByPeriod(
    invoices: InvoiceBase[],
    period: Period,
    dateRange?: string
): RiskGraphPoint[] {
    const now = new Date()

    if (period === "weekly") {
        const numWeeks = dateRange ? parseInt(dateRange) : 4
        const buckets: RiskGraphPoint[] = Array.from({ length: numWeeks }, (_, i) => ({
            label: `Week ${i + 1}`,
            clean: 0,
            flagged: 0,
            risk: 0,
        }))
        const riskSums = new Array(numWeeks).fill(0)
        const riskCounts = new Array(numWeeks).fill(0)

        for (const inv of invoices) {
            const d = getDate(inv)
            if (!d) continue
            const daysAgo = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
            if (daysAgo < 0 || daysAgo >= numWeeks * 7) continue
            const bucketIndex = (numWeeks - 1) - Math.floor(daysAgo / 7)
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

    if (period === "monthly" || (period === "yearly" && dateRange !== "all" && dateRange !== undefined)) {
        let numMonths = 6
        let targetYear = now.getFullYear()
        let targetMonth = now.getMonth()

        if (period === "monthly") {
            numMonths = dateRange ? parseInt(dateRange) : 6
        } else {
            numMonths = 12
            targetYear = parseInt(dateRange || String(now.getFullYear()))
            targetMonth = 11 // Dec
        }

        const months: RiskGraphPoint[] = []
        const riskSums: number[] = []
        const riskCounts: number[] = []

        for (let i = numMonths - 1; i >= 0; i--) {
            const d = new Date(targetYear, targetMonth - i, 1)
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
            for (let i = 0; i < numMonths; i++) {
                const target = new Date(targetYear, targetMonth - ((numMonths - 1) - i), 1)
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

    // Yearly (All Years)
    const yearMap = new Map<number, { clean: number; flagged: number; sum: number; count: number }>()
    let minYear = now.getFullYear()
    let maxYear = now.getFullYear()

    for (const inv of invoices) {
        const d = getDate(inv)
        if (!d) continue
        const y = d.getFullYear()
        minYear = Math.min(minYear, y)
        maxYear = Math.max(maxYear, y)
    }

    if (minYear === maxYear) {
        minYear = maxYear - 2
    }

    for (let y = minYear; y <= maxYear; y++) {
        yearMap.set(y, { clean: 0, flagged: 0, sum: 0, count: 0 })
    }

    for (const inv of invoices) {
        const d = getDate(inv)
        if (!d) continue
        const y = d.getFullYear()
        const bucket = yearMap.get(y)
        if (!bucket) continue

        if (isClean(inv)) bucket.clean++
        else if (isFlagged(inv)) bucket.flagged++

        const score = inv.aiVerdict?.riskScore
        if (typeof score === "number" && !isNaN(score)) {
            bucket.sum += score
            bucket.count++
        }
    }

    return Array.from(yearMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([y, b]) => ({
            label: String(y),
            clean: b.clean,
            flagged: b.flagged,
            risk: b.count > 0 ? Math.min(100, Math.round(b.sum / b.count)) : 0
        }))
}

// --- computeApprovalRate ------------------------------------------------------
// Flat counts from entire invoice array - period-agnostic (current state)
// Only checks human status/decision to properly categorize Pending invoices.

export function computeApprovalRate(invoices: InvoiceBase[]): ApprovalPoint[] {
    let accepted = 0
    let rejected = 0
    let pending = 0

    for (const inv of invoices) {
        const status = String(inv.status ?? "").toLowerCase()
        const decision = String(inv.reviewDecision ?? "").toLowerCase()

        if (status === "approved" || status === "accepted" || status === "clean" || status === "anchored" || decision === "approved") {
            accepted++
        } else if (status === "rejected" || status === "flagged" || decision === "rejected") {
            rejected++
        } else {
            pending++
        }
    }

    return [
        { name: "Accepted", value: accepted, color: "#10b981" },
        { name: "Rejected", value: rejected, color: "#ef4444" },
        { name: "Pending",  value: pending,  color: "#f59e0b" },
    ]
}

// --- groupInvoicesByKey -------------------------------------------------------
// Groups invoices by a string field (e.g. "companyName", "uploadedByUserId").
// Note: uploadedByUserId from the API is a MongoDB ObjectId string - the component
//       renders it as a truncated ID. uploadedByName is NOT populated by the API.

export function groupInvoicesByKey(
    invoices: InvoiceBase[],
    key: string
): GroupedRow[] {
    const map = new Map<string, GroupedRow>()

    for (const inv of invoices) {
        let name: string = inv[key]
        
        // Fallbacks just in case the API maps it differently
        if (!name && (key.includes("uploadedBy") || key === "userId")) {
            name = inv.uploadedByUserId || inv.uploadedBy || inv.userId || inv.uploadedByName
        }
        if (!name) name = "Unknown"

        if (!map.has(name)) {
            map.set(name, { name, total: 0, clean: 0, flagged: 0 })
        }
        const row = map.get(name)!
        row.total++
        if (isClean(inv)) row.clean++
        else if (isFlagged(inv)) row.flagged++
    }

    const all = Array.from(map.values()).sort((a, b) => b.total - a.total)

    // If there are real rows alongside Unknown, drop Unknown (it just means the field was unset)
    const real = all.filter((r) => r.name !== "Unknown")
    return real.length > 0 ? real : all
}

// --- ReportDataPoint ----------------------------------------------------------

export type ReportDataPoint = {
    label: string       // "Jan" | "2023" etc.
    approved: number
    pending: number
    rejected: number
    value: number       // sum of invoice.amount ?? invoice.totalAmount
}

// --- groupInvoicesForReports --------------------------------------------------
// Monthly: last 6 calendar months (oldest → newest)
// Yearly:  last 4 calendar years  (oldest → newest)

export function groupInvoicesForReports(
    invoices: InvoiceBase[],
    mode: "monthly" | "yearly"
): ReportDataPoint[] {
    const now = new Date()

    if (mode === "monthly") {
        const months: ReportDataPoint[] = []
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            months.push({
                label: d.toLocaleString("default", { month: "short" }),
                approved: 0, pending: 0, rejected: 0, value: 0,
            })
        }

        for (const inv of invoices) {
            const d = getDate(inv)
            if (!d) continue
            const diff = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
            if (diff < 0 || diff > 5) continue
            const bucket = months[5 - diff]
            const amount = Number((inv as any).amount ?? (inv as any).totalAmount ?? 0)

            if (isClean(inv)) bucket.approved++
            else if (isFlagged(inv)) bucket.rejected++
            else bucket.pending++
            bucket.value += amount
        }
        return months
    }

    // yearly — last 4 calendar years
    const years: ReportDataPoint[] = []
    for (let i = 3; i >= 0; i--) {
        years.push({
            label: String(now.getFullYear() - i),
            approved: 0, pending: 0, rejected: 0, value: 0,
        })
    }

    for (const inv of invoices) {
        const d = getDate(inv)
        if (!d) continue
        const diff = now.getFullYear() - d.getFullYear()
        if (diff < 0 || diff > 3) continue
        const bucket = years[3 - diff]
        const amount = Number((inv as any).amount ?? (inv as any).totalAmount ?? 0)

        if (isClean(inv)) bucket.approved++
        else if (isFlagged(inv)) bucket.rejected++
        else bucket.pending++
        bucket.value += amount
    }
    return years
}
