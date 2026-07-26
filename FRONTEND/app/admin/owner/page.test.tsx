import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/hooks/global/use-auth", () => ({
  useAuth: () => ({
    user: {
      username: "owner-user",
      role: "OWNER",
      mustChangePassword: false,
    },
  }),
}))

vi.mock("@/hooks/owner/use-owner-dashboard", () => ({
  useOwnerDashboard: () => ({
    companiesCount: 2,
    totalUsers: 10,
    activeUsers: 8,
    disabledUsers: 2,
    totalInvoices: 12,
    verifiedInvoices: 9,
    flaggedCount: 3,
    blockchainTransactions: 7,
    loading: false,
    isError: false,
  }),
}))

import OwnerDashboard from "./page"

describe("OwnerDashboard", () => {
  it("does not expose Blockchain Transactions statistics or navigation", () => {
    render(<OwnerDashboard />)

    expect(screen.getByRole("heading", { name: "Owner Dashboard" })).toBeVisible()
    expect(screen.getByText("Total Invoices")).toBeVisible()
    expect(screen.queryByText("Blockchain Transactions")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Open Blockchain Transactions" })).not.toBeInTheDocument()
  })
})
