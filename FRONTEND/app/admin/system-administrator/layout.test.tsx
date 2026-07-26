import { render, screen, within } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/system-administrator/settings",
}))

vi.mock("@/components/auth/RoleGuard", () => ({
  RoleGuard: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock("@/components/layout/AppSidebar", () => ({
  AppSidebar: ({
    links,
    showSignOut = true,
  }: {
    links: Array<{ href: string; label: string }>
    showSignOut?: boolean
  }) => (
    <nav aria-label="System Administrator sidebar">
      {links.map((link) => (
        <a href={link.href} key={link.href}>{link.label}</a>
      ))}
      {showSignOut && <button type="button">Sign out</button>}
    </nav>
  ),
}))

vi.mock("@/components/layout/TopBar", () => ({
  TopBar: ({ profileLink }: { profileLink: string }) => (
    <a href={profileLink}>Dropdown Profile</a>
  ),
}))

vi.mock("@/hooks/global/use-persisted-sidebar", () => ({
  usePersistedSidebar: () => [false, vi.fn()],
}))

vi.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.join(" "),
}))

import SystemAdministratorLayout from "./layout"

describe("SystemAdministratorLayout navigation", () => {
  it("keeps Profile in the account dropdown but omits it from the sidebar", () => {
    render(<SystemAdministratorLayout><div>Page content</div></SystemAdministratorLayout>)

    const sidebar = screen.getByRole("navigation", { name: "System Administrator sidebar" })
    expect(within(sidebar).queryByRole("link", { name: "Profile" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Dropdown Profile" })).toHaveAttribute(
      "href",
      "/admin/system-administrator/settings",
    )
  })

  it("shows Platform Configuration once and omits the separate Maintenance destination", () => {
    render(<SystemAdministratorLayout><div>Page content</div></SystemAdministratorLayout>)

    const sidebar = screen.getByRole("navigation", { name: "System Administrator sidebar" })
    expect(within(sidebar).getAllByRole("link", { name: "Platform Configuration" })).toHaveLength(1)
    expect(within(sidebar).queryByRole("link", { name: "Maintenance" })).not.toBeInTheDocument()
  })

  it("keeps logout in the account dropdown but omits Sign out from the sidebar", () => {
    render(<SystemAdministratorLayout><div>Page content</div></SystemAdministratorLayout>)

    const sidebar = screen.getByRole("navigation", { name: "System Administrator sidebar" })
    expect(within(sidebar).queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Dropdown Profile" })).toBeInTheDocument()
  })
})
