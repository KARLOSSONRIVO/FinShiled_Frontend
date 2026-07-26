import { apiClient } from "@/lib/api-client"
import type { AuditLog } from "@/lib/types"

export interface ServiceHealth {
  name: "api" | "database" | "redis" | "ai" | "ipfs" | "blockchain" | "email"
  status: "operational" | "configured" | "unavailable" | "not_configured"
  checkedAt: string
  latencyMs: number
  lastSuccessfulCheck: string | null
  errorCode?: string
}

export interface FailedBackgroundJob {
  id: string
  service: string
  name: string
  failedAt: string | null
  attemptsMade: number
  errorCode: string
}

export interface SystemStatus {
  services: ServiceHealth[]
  failedBackgroundJobs: FailedBackgroundJob[]
  recentSecurityEvents: AuditLog[]
  recentAuditEvents: AuditLog[]
  lastHealthCheck: string
}

export interface PlatformConfiguration {
  maintenanceMode: boolean
  maintenanceMessage: string
  statusRefreshSeconds: number
  capabilities?: Record<string, boolean>
}

export const SystemService = {
  getStatus: async (): Promise<SystemStatus> => {
    const { data } = await apiClient.get<{ ok: boolean; data: SystemStatus }>("/system/status")
    return data.data
  },
  getSecurityEvents: async (): Promise<AuditLog[]> => {
    const { data } = await apiClient.get<{ ok: boolean; data: AuditLog[] }>("/system/security-events")
    return data.data
  },
  getConfiguration: async (): Promise<PlatformConfiguration> => {
    const { data } = await apiClient.get<{ ok: boolean; data: PlatformConfiguration }>("/system/configuration")
    return data.data
  },
  updateConfiguration: async (payload: Pick<PlatformConfiguration, "maintenanceMessage" | "statusRefreshSeconds"> & { confirmation: string }) => {
    const { data } = await apiClient.put("/system/configuration", payload)
    return data
  },
  setMaintenance: async (payload: { enabled: boolean; message?: string; confirmation: string }) => {
    const { data } = await apiClient.put("/system/maintenance", payload)
    return data
  },
}
