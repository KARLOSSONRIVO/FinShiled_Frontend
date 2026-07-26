import { describe, expect, it, vi } from "vitest"

const navigation = vi.hoisted(() => ({
  redirectedTo: null as string | null,
}))

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    navigation.redirectedTo = path
    throw new Error("NEXT_REDIRECT")
  },
}))

vi.mock("@/hooks/blockchain/use-blockchain", () => ({
  useBlockchain: () => ({
    search: "",
    setSearch: vi.fn(),
    invoices: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    setPage: vi.fn(),
    sortConfig: null,
    requestSort: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
}))

import OwnerBlockchainPage from "./page"

describe("OwnerBlockchainPage", () => {
  it("redirects Owner away from the protected technical page", () => {
    expect(() => OwnerBlockchainPage()).toThrow("NEXT_REDIRECT")
    expect(navigation.redirectedTo).toBe("/unauthorized")
  })
})
