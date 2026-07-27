import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AuditLogsPage from "./page"

const hookState = vi.hoisted(() => ({
  value: {
    search: null as string | null,
    setSearch: vi.fn(),
    action: null as string | null,
    actorRole: null as string | null,
    location: null as string | null,
    countryCode: null as string | null,
    setFilter: vi.fn(),
    setFilters: vi.fn(),
    auditLogs: [],
    pagination: { page: 1, limit: 20, total: 40, totalPages: 2 },
    setPage: vi.fn(),
    isLoading: false,
    isError: false,
    error: null as string | null,
    refetch: vi.fn(),
    sortConfig: { key: "createdAt", direction: "desc" as const },
    requestSort: vi.fn(),
  },
}))

vi.mock("@/hooks/audit/use-system-admin-audit-logs", () => ({
  useAuditLogs: () => hookState.value,
}))

vi.mock("@/components/common/SearchInput", () => ({
  SearchInput: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (value: string) => void
    placeholder: string
  }) => (
    <input
      aria-label={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuCheckboxItem: ({
    children,
    onCheckedChange,
  }: {
    children: React.ReactNode
    onCheckedChange: () => void
  }) => <button onClick={onCheckedChange}>{children}</button>,
}))

vi.mock("@/components/ui/pagination-custom", () => ({
  Pagination: ({ onPageChange }: { onPageChange: (page: number) => void }) => (
    <button onClick={() => onPageChange(2)}>Page 2</button>
  ),
}))

describe("System Administrator Audit Logs page", () => {
  beforeEach(() => {
    hookState.value.search = null
    hookState.value.action = null
    hookState.value.actorRole = null
    hookState.value.location = null
    hookState.value.countryCode = null
    hookState.value.isLoading = false
    hookState.value.isError = false
    hookState.value.error = null
    vi.clearAllMocks()
  })

  it("sends location and country filters to the audit-log query state", () => {
    render(<AuditLogsPage />)

    fireEvent.change(screen.getByLabelText("Filter city, region, or country"), {
      target: { value: "Manila" },
    })
    fireEvent.change(screen.getByLabelText("Country code"), {
      target: { value: "ph" },
    })
    fireEvent.blur(screen.getByLabelText("Country code"))

    expect(hookState.value.setFilter).toHaveBeenCalledWith("location", "Manila")
    expect(hookState.value.setFilter).toHaveBeenCalledWith("countryCode", "PH")
  })

  it("preserves pagination", () => {
    render(<AuditLogsPage />)

    fireEvent.click(screen.getByRole("button", { name: "Page 2" }))

    expect(hookState.value.setPage).toHaveBeenCalledWith(2)
  })

  it("renders a retryable error state", () => {
    hookState.value.isError = true
    hookState.value.error = "Audit API unavailable"

    render(<AuditLogsPage />)
    fireEvent.click(screen.getByRole("button", { name: "Try again" }))

    expect(screen.getByText("Audit API unavailable")).toBeInTheDocument()
    expect(hookState.value.refetch).toHaveBeenCalledOnce()
  })

  it("renders loading skeletons while the audit API is pending", () => {
    hookState.value.isLoading = true

    const { container } = render(<AuditLogsPage />)

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0)
    expect(screen.queryByText("No audit events found")).not.toBeInTheDocument()
  })
})
