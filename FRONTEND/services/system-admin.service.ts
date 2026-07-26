import { apiClient } from "@/lib/api-client"
import type { PaginationDetails, User } from "@/lib/types"

export interface SystemAdministratorList { items: User[]; pagination: PaginationDetails }

export const SystemAdminService = {
  list: async (): Promise<SystemAdministratorList> => {
    const { data } = await apiClient.get<{ ok: boolean; data: SystemAdministratorList }>("/system-admins")
    return data.data
  },
  create: async (payload: { email: string; username: string; confirmation: string }) => {
    const { data } = await apiClient.post("/system-admins", payload)
    return data
  },
  updateStatus: async (id: string, payload: { status: "active" | "disabled"; reason: string; confirmation: string }) => {
    const { data } = await apiClient.put(`/system-admins/${id}/status`, payload)
    return data
  },
  resetAccess: async (id: string, payload: { reason: string; confirmation: string }) => {
    const { data } = await apiClient.post(`/system-admins/${id}/reset-access`, payload)
    return data
  },
}
