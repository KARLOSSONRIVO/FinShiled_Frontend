import { apiClient } from "@/lib/api-client"
import { AuditLog, AuditLogPage, AuditLogQuery } from "@/lib/types"

export const AuditService = {
    /**
     * Fetch audit logs. Backend access is restricted to SYSTEM_ADMIN.
     */
    getLogs: async (params?: AuditLogQuery): Promise<AuditLogPage> => {
        const { data } = await apiClient.get<{ ok: boolean; data: AuditLogPage }>("/audit-logs", { params })
        return data.data
    },

    /**
     * Get details for a specific audit log by ID
     */
    getLogById: async (id: string): Promise<AuditLog> => {
        const { data } = await apiClient.get<{ ok: boolean; data: AuditLog }>(`/audit-logs/${id}`)
        return data.data
    }
}
