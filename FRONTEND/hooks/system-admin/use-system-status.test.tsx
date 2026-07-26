import { act, renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SystemService, type PlatformConfiguration, type SystemStatus } from "@/services/system.service"
import { useSystemStatus } from "./use-system-status"
import { getStatusRefreshIntervalMs } from "./use-platform-configuration"

const systemStatus: SystemStatus = {
  services: [],
  failedBackgroundJobs: [],
  recentSecurityEvents: [],
  recentAuditEvents: [],
  lastHealthCheck: "2026-07-26T00:00:00.000Z",
}

const configuredInterval: PlatformConfiguration = {
  maintenanceMode: false,
  maintenanceMessage: "FinShield is undergoing scheduled maintenance.",
  statusRefreshSeconds: 60,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("useSystemStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("polls System Status using the saved refresh interval", async () => {
    vi.spyOn(SystemService, "getConfiguration").mockResolvedValue(configuredInterval)
    const statusSpy = vi.spyOn(SystemService, "getStatus").mockResolvedValue(systemStatus)

    renderHook(() => useSystemStatus(), { wrapper: createWrapper() })
    await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(SystemService.getConfiguration).toHaveBeenCalledTimes(1))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
    expect(statusSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
    await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(2))
  })

  it("falls back to 30 seconds when configuration cannot be loaded", async () => {
    vi.spyOn(SystemService, "getConfiguration").mockRejectedValue(new Error("unavailable"))
    const statusSpy = vi.spyOn(SystemService, "getStatus").mockResolvedValue(systemStatus)

    renderHook(() => useSystemStatus(), { wrapper: createWrapper() })
    await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(1))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
    await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(2))
  })

  it("applies a changed refresh interval without remounting", async () => {
    vi.spyOn(SystemService, "getConfiguration").mockResolvedValue(configuredInterval)
    const statusSpy = vi.spyOn(SystemService, "getStatus").mockResolvedValue(systemStatus)
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useSystemStatus(), { wrapper })
    await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(SystemService.getConfiguration).toHaveBeenCalledTimes(1))

    act(() => {
      queryClient.setQueryData<PlatformConfiguration>(["platform-configuration"], {
        ...configuredInterval,
        statusRefreshSeconds: 15,
      })
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15_000)
    })

    await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(2))
  })

  it("falls back to 30 seconds for a non-integer configuration value", () => {
    expect(getStatusRefreshIntervalMs(15.5)).toBe(30_000)
  })
})
