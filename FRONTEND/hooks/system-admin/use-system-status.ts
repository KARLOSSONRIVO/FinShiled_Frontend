"use client"

import { useQuery } from "@tanstack/react-query"
import { SystemService } from "@/services/system.service"
import {
  getStatusRefreshIntervalMs,
  usePlatformConfiguration,
} from "./use-platform-configuration"

export function useSystemStatus() {
  const { data: configuration } = usePlatformConfiguration()

  return useQuery({
    queryKey: ["system-status"],
    queryFn: SystemService.getStatus,
    refetchInterval: getStatusRefreshIntervalMs(configuration?.statusRefreshSeconds),
  })
}
