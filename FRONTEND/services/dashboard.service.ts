import { InvoiceService } from "./invoice.service"
import { apiClient } from "@/lib/api-client"

export interface DashboardStats {
    totalRevenue: number
    activeInvoices: number
    flaggedInvoices: number
    verifiedInvoices: number
    totalUsers?: number
    totalCompanies?: number
    pendingReviews?: number
    flaggedCount?: number
    companiesCount?: number
    verifiedOnChain?: number
    totalValue?: number
    totalOrganizations?: number
    activeUsers?: number
    disabledUsers?: number
    totalInvoices?: number
}

export const DashboardService = {
    /**
     * Get aggregated stats for Owner
     * Simulates GET /dashboard/stats
     */
    getOwnerStats: async (): Promise<DashboardStats> => {
        const { data } = await apiClient.get<{ ok: boolean; data: DashboardStats }>("/dashboard/owner")
        return data.data
    },

    /**
     * Get recent audit logs — returns the 5 most recent entries
     */
    getCompanyStats: async (): Promise<DashboardStats> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
            totalRevenue: 0,
            activeInvoices: 0,
            flaggedInvoices: 0,
            verifiedInvoices: 0
        }
    },

    getAuditorStats: async (): Promise<DashboardStats> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return {
            totalRevenue: 0,
            activeInvoices: 0,
            flaggedInvoices: 0,
            verifiedInvoices: 0,
            pendingReviews: 0
        }
    },

    getRegulatorStats: async (): Promise<DashboardStats> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const invoices: any[] = []
        return {
            totalRevenue: 0,
            activeInvoices: invoices.length,
            flaggedInvoices: 0, // Not used directly
            verifiedInvoices: 0, // Not used directly
            companiesCount: 0,
            verifiedOnChain: invoices.filter(i => i.blockchain_txHash).length,
            totalValue: invoices.reduce((sum, inv) => sum + (inv.totals_total ?? 0), 0),
            flaggedCount: invoices.filter(i => i.status === "flagged").length
        }
    }
}
