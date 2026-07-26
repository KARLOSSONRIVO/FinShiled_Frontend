import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/owner",
}))

vi.mock("@/components/auth/RoleGuard", () => ({
  RoleGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/layout/TopBar", () => ({
  TopBar: () => null,
}))

vi.mock("@/hooks/global/use-auth", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

vi.mock("@/hooks/global/use-persisted-sidebar", () => ({
  usePersistedSidebar: () => [false, vi.fn()],
}))

import OwnerLayout from "./layout"

describe("OwnerLayout navigation", () => {
  it("does not expose Blockchain Transactions to Owner", () => {
    render(<OwnerLayout><div>Owner content</div></OwnerLayout>)

    expect(screen.getByText("Owner content")).toBeVisible()
    expect(screen.queryByRole("link", { name: "Blockchain Transactions" })).not.toBeInTheDocument()
  })
})
