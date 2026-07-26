import { useQuery } from "@tanstack/react-query"
import { DashboardService } from "@/services/dashboard.service"

interface UseOwnerDashboardOptions {
    enabled?: boolean;
}

export function useOwnerDashboard({ enabled = true }: UseOwnerDashboardOptions = {}) {
    const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
        queryKey: ["owner-dashboard-stats"],
        queryFn: DashboardService.getOwnerStats,
        enabled
    })

    return {
        loading: statsLoading,
        isError: statsError,
        companiesCount: stats?.totalOrganizations || 0,
        totalUsers: stats?.totalUsers || 0,
        activeUsers: stats?.activeUsers || 0,
        disabledUsers: stats?.disabledUsers || 0,
        totalInvoices: stats?.totalInvoices || 0,
        verifiedInvoices: stats?.verifiedInvoices || 0,
        flaggedCount: stats?.flaggedInvoices || 0,
    }
}
