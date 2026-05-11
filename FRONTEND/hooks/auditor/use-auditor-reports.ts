"use client"

import { useQuery } from "@tanstack/react-query"
import { InvoiceService } from "@/services/invoice.service"

export function useAuditorReports() {
    const { data: allInvoices = [], isLoading } = useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const res = await InvoiceService.list({ limit: 100 })
            return res.data?.items || []
        }
    })

    const totalValue = allInvoices.reduce((sum, inv) => sum + (Number(inv.amount || inv.totalAmount) || 0), 0)

    const verifiedValue = allInvoices
        .filter((i) =>
            String(i.reviewDecision) === "approved" ||
            (String(i.reviewDecision) !== "rejected" && (i.aiVerdict?.verdict === "clean" || (!i.aiVerdict?.verdict && String(i.status) !== "flagged" && String(i.status) !== "rejected")))
        )
        .reduce((sum, inv) => sum + (Number(inv.amount || inv.totalAmount) || 0), 0)

    const flaggedValue = allInvoices
        .filter((i) =>
            String(i.reviewDecision) === "rejected" ||
            (String(i.reviewDecision) !== "approved" && (String(i.status) === "flagged" || i.aiVerdict?.verdict === "flagged" || String(i.status) === "rejected"))
        )
        .reduce((sum, inv) => sum + (Number(inv.amount || inv.totalAmount) || 0), 0)

    const statusCounts = {
        approved: allInvoices.filter((i) =>
            String(i.status) === "approved" ||
            String(i.reviewDecision) === "approved"
        ).length,
        rejected: allInvoices.filter((i) =>
            String(i.status) === "rejected" ||
            String(i.reviewDecision) === "rejected"
        ).length,
        pending: allInvoices.filter((i) =>
            String(i.status) !== "approved" &&
            String(i.reviewDecision) !== "approved" &&
            String(i.status) !== "rejected" &&
            String(i.reviewDecision) !== "rejected"
        ).length,
    }

    const averageRiskScore = allInvoices.length > 0
        ? allInvoices.reduce((sum, inv) => sum + (Number(inv.aiVerdict?.riskScore) || 0), 0) / allInvoices.length
        : 0

    const verifiedCount = allInvoices.filter((i) => i.aiVerdict?.verdict === "clean").length
    const aiFlaggedCount = allInvoices.filter((i) => i.aiVerdict?.verdict === "flagged").length

    const fraudCount = allInvoices.filter((i) =>
        (String(i.status) === "flagged" || i.aiVerdict?.verdict === "flagged") &&
        String(i.reviewDecision) !== "approved" &&
        String(i.reviewDecision) !== "rejected"
    ).length

    const fraudRate = allInvoices.length > 0
        ? (fraudCount / allInvoices.length) * 100
        : 0

    return {
        invoices: allInvoices,
        totalCount: allInvoices.length,
        metrics: {
            totalValue,
            verifiedValue,
            flaggedValue,
        },
        statusCounts,
        riskMetrics: {
            averageRiskScore,
            verifiedCount,
            aiFlaggedCount,
            fraudRate,
            fraudCount
        },
        isLoading
    }
}
