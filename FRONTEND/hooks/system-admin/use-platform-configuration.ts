"use client"

import { useQuery } from "@tanstack/react-query"
import { SystemService } from "@/services/system.service"

const DEFAULT_STATUS_REFRESH_SECONDS = 30
const MIN_STATUS_REFRESH_SECONDS = 15
const MAX_STATUS_REFRESH_SECONDS = 300

export function getStatusRefreshIntervalMs(value?: number) {
  const seconds = Number(value)

  if (
    !Number.isInteger(seconds)
    || seconds < MIN_STATUS_REFRESH_SECONDS
    || seconds > MAX_STATUS_REFRESH_SECONDS
  ) {
    return DEFAULT_STATUS_REFRESH_SECONDS * 1000
  }

  return seconds * 1000
}

export function usePlatformConfiguration() {
  return useQuery({
    queryKey: ["platform-configuration"],
    queryFn: SystemService.getConfiguration,
  })
}
