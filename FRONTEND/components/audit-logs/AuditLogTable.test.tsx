import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { AuditLogDetailsDialog } from "@/components/audit-logs/AuditLogDetailsDialog"
import { AuditLogTable } from "@/components/audit-logs/AuditLogTable"
import { AuditActions, type AuditLog } from "@/lib/types"

const resolvedLog: AuditLog = {
  id: "audit-1",
  actorId: "user-1",
  actorRole: "SYSTEM_ADMIN",
  actor: {
    username: "admin",
    email: "admin@finshield.test",
  },
  action: AuditActions.LOGIN_SUCCESS,
  targetType: "USER",
  targetId: "user-1",
  organizationId: null,
  summary: "User logged in successfully",
  metadata: {},
  ipAddress: "8.8.8.8",
  ip: "8.8.8.8",
  location: {
    display: "Quezon City, Metro Manila, Philippines",
    city: "Quezon City",
    region: "Metro Manila",
    country: "Philippines",
    countryCode: "PH",
    timezone: "Asia/Manila",
    lookupStatus: "RESOLVED",
    resolvedAt: "2026-07-27T07:17:21.000Z",
  },
  userAgent: "Mozilla/5.0 FinShield-Test-Agent",
  requestId: "request-1",
  outcome: "SUCCESS",
  failureReason: null,
  isArchived: false,
  archivedAt: null,
  archiveKey: null,
  archiveFileHash: null,
  createdAt: "2026-07-27T07:17:21.000Z",
}

function TableWithDetails({ log = resolvedLog }: { log?: AuditLog }) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  return (
    <>
      <AuditLogTable logs={[log]} onSelectLog={setSelectedLog} />
      <AuditLogDetailsDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  )
}

describe("AuditLogTable", () => {
  it("replaces the visible User Agent column with Location", () => {
    render(<TableWithDetails />)

    expect(screen.getByRole("columnheader", { name: "Location" })).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: "User Agent" })).not.toBeInTheDocument()
    expect(screen.getByText("Quezon City, Metro Manila, Philippines")).toBeInTheDocument()
    expect(screen.queryByText("Mozilla/5.0 FinShield-Test-Agent")).not.toBeInTheDocument()
  })

  it("retains the raw User Agent in the protected event-details dialog", () => {
    render(<TableWithDetails />)

    fireEvent.click(screen.getByRole("button", { name: "View details for LOGIN SUCCESS" }))

    expect(screen.getByRole("dialog", { name: "Audit event details" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "User Agent" })).toBeInTheDocument()
    expect(screen.getByText("Mozilla/5.0 FinShield-Test-Agent")).toBeInTheDocument()
    expect(screen.getByText("RESOLVED")).toBeInTheDocument()
    expect(screen.getByText("request-1")).toBeInTheDocument()
  })

  it("shows a safe fallback for an older record without location data", () => {
    const historicalLog = {
      ...resolvedLog,
      id: "audit-old",
      location: undefined,
    } as unknown as AuditLog

    render(<TableWithDetails log={historicalLog} />)

    expect(screen.getByText("Location unavailable")).toBeInTheDocument()
  })

  it("keeps timestamp sorting wired to the API sort key", () => {
    const requestSort = vi.fn()

    render(
      <AuditLogTable
        logs={[resolvedLog]}
        sortConfig={{ key: "createdAt", direction: "desc" }}
        requestSort={requestSort}
      />,
    )
    fireEvent.click(screen.getByRole("button", { name: /Timestamp/ }))

    expect(requestSort).toHaveBeenCalledWith("createdAt")
  })
})
