import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { SystemService, type PlatformConfiguration } from "@/services/system.service"
import PlatformConfigurationPage from "./page"

const normalConfiguration: PlatformConfiguration = {
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
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("PlatformConfigurationPage", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("opens an enable-maintenance modal and requires the exact phrase", async () => {
    vi.spyOn(SystemService, "getConfiguration").mockResolvedValue(normalConfiguration)

    render(<PlatformConfigurationPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole("button", { name: "Enable maintenance" }))
    const confirmButton = screen.getByRole("button", { name: "Confirm enable maintenance" })
    expect(confirmButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText("Type ENABLE MAINTENANCE to continue"), {
      target: { value: "enable maintenance" },
    })
    expect(confirmButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText("Type ENABLE MAINTENANCE to continue"), {
      target: { value: "ENABLE MAINTENANCE" },
    })
    expect(confirmButton).toBeEnabled()
  })

  it("sends the protected enable-maintenance payload", async () => {
    const configurationSpy = vi.spyOn(SystemService, "getConfiguration").mockResolvedValue(normalConfiguration)
    const maintenanceSpy = vi.spyOn(SystemService, "setMaintenance").mockResolvedValue({ ok: true })

    render(<PlatformConfigurationPage />, { wrapper: createWrapper() })

    fireEvent.click(await screen.findByRole("button", { name: "Enable maintenance" }))
    fireEvent.change(screen.getByLabelText("Type ENABLE MAINTENANCE to continue"), {
      target: { value: "ENABLE MAINTENANCE" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirm enable maintenance" }))

    await waitFor(() => {
      expect(maintenanceSpy).toHaveBeenCalledWith({
        enabled: true,
        message: normalConfiguration.maintenanceMessage,
        confirmation: "ENABLE MAINTENANCE",
      })
    })
    await waitFor(() => expect(configurationSpy).toHaveBeenCalledTimes(2))
  })

  it("requires DISABLE MAINTENANCE while maintenance is active", async () => {
    vi.spyOn(SystemService, "getConfiguration").mockResolvedValue({
      ...normalConfiguration,
      maintenanceMode: true,
    })

    render(<PlatformConfigurationPage />, { wrapper: createWrapper() })

    expect(await screen.findByText("Maintenance active")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Disable maintenance" }))

    expect(screen.getByLabelText("Type DISABLE MAINTENANCE to continue")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Confirm disable maintenance" })).toBeDisabled()
  })
})
