import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppSidebar } from "./AppSidebar"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/system-administrator",
}))

vi.mock("@/hooks/global/use-auth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}))

describe("AppSidebar", () => {
  it("omits its Sign out control when logout is available elsewhere", () => {
    render(
      <AppSidebar
        links={[]}
        collapsed={false}
        setCollapsed={vi.fn()}
        title="FinShield Systems"
        showSignOut={false}
      />,
    )

    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument()
  })
})
