import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"

const { redirectSpy } = vi.hoisted(() => ({
  redirectSpy: vi.fn(),
}))

vi.mock("next/navigation", () => ({
  redirect: redirectSpy,
}))

import MaintenancePage from "./page"

describe("retired Maintenance route", () => {
  it("redirects to Platform Configuration", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MaintenancePage />
      </QueryClientProvider>,
    )

    expect(redirectSpy).toHaveBeenCalledWith(
      "/admin/system-administrator/platform-configuration",
    )
  })
})
