"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Filter } from "lucide-react"
import { AuditLogDetailsDialog } from "@/components/audit-logs/AuditLogDetailsDialog"
import { AuditLogTable } from "@/components/audit-logs/AuditLogTable"
import { SearchInput } from "@/components/common/SearchInput"
import { AuditLogTableSkeleton } from "@/components/skeletons/audit-log-table-skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination-custom"
import { useAuditLogs } from "@/hooks/audit/use-system-admin-audit-logs"
import { AuditActions, type AuditLog } from "@/lib/types"
import { cn } from "@/lib/utils"

const ROLES = ["OWNER", "SYSTEM_ADMIN", "COMPANY_MANAGER", "COMPANY_USER", "AUDITOR", "REGULATOR"]

const ACTION_GROUPS: Record<string, AuditActions[]> = {
  Authentication: [AuditActions.LOGIN_SUCCESS, AuditActions.LOGIN_FAILURE, AuditActions.ACCOUNT_LOCKED, AuditActions.LOGOUT],
  MFA: [
    AuditActions.MFA_EMAIL_CODE_REQUESTED,
    AuditActions.MFA_EMAIL_VERIFIED,
    AuditActions.MFA_EMAIL_VERIFICATION_FAILED,
    AuditActions.MFA_AUTHENTICATOR_SETUP_STARTED,
    AuditActions.MFA_AUTHENTICATOR_ENABLED,
    AuditActions.MFA_AUTHENTICATOR_VERIFIED,
    AuditActions.MFA_AUTHENTICATOR_FAILED,
    AuditActions.MFA_AUTHENTICATOR_REMOVED,
    AuditActions.MFA_AUTHENTICATOR_REPLACED,
    AuditActions.MFA_PREFERRED_METHOD_CHANGED,
    AuditActions.MFA_ADMIN_AUTHENTICATOR_RESET,
    AuditActions.MFA_EXCESSIVE_ATTEMPTS,
  ],
  "User Management": [
    AuditActions.USER_CREATED,
    AuditActions.USER_UPDATED,
    AuditActions.USER_DISABLED,
    AuditActions.USER_ENABLED,
    AuditActions.WELCOME_EMAIL_SENT,
    AuditActions.WELCOME_EMAIL_FAILED,
    AuditActions.PASSWORD_CHANGED,
    AuditActions.PASSWORD_RESET_FORCED,
    AuditActions.FORCED_PASSWORD_CHANGE_COMPLETED,
    AuditActions.USER_ROLE_CHANGED,
  ],
  "System Administration": [
    AuditActions.SYSTEM_ADMIN_CREATED,
    AuditActions.SYSTEM_ADMIN_ENABLED,
    AuditActions.SYSTEM_ADMIN_DISABLED,
    AuditActions.SYSTEM_ADMIN_ACCESS_RESET,
    AuditActions.PLATFORM_CONFIGURATION_CHANGED,
    AuditActions.MAINTENANCE_MODE_CHANGED,
  ],
  Organization: [AuditActions.ORG_CREATED, AuditActions.ORG_UPDATED, AuditActions.ORG_TEMPLATE_UPLOADED],
  Assignments: [AuditActions.ASSIGNMENT_CREATED, AuditActions.ASSIGNMENT_UPDATED, AuditActions.ASSIGNMENT_DELETED],
  Invoices: [AuditActions.INVOICE_UPLOADED, AuditActions.INVOICE_FLAGGED],
  Reviews: [AuditActions.REVIEW_SUBMITTED, AuditActions.REVIEW_UPDATED],
  Policies: [AuditActions.POLICY_CREATED, AuditActions.POLICY_UPDATED, AuditActions.POLICY_DELETED],
  "Terms and Conditions": [AuditActions.TERMS_CREATED, AuditActions.TERMS_UPDATED, AuditActions.TERMS_DELETED],
  Archival: [AuditActions.ARCHIVE_EXECUTED, AuditActions.ARCHIVE_ACCESSED],
}

export default function AuditLogsPage() {
  const {
    search,
    setSearch,
    action,
    actorRole,
    location,
    countryCode,
    setFilter,
    setFilters,
    auditLogs,
    pagination,
    setPage,
    isLoading,
    isError,
    error,
    refetch,
    sortConfig,
    requestSort,
  } = useAuditLogs()
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [countryDraft, setCountryDraft] = useState(countryCode || "")

  useEffect(() => setCountryDraft(countryCode || ""), [countryCode])

  const filtersActive = Boolean(action || actorRole || location || countryCode)

  const commitCountryFilter = () => {
    const normalized = countryDraft.trim().toUpperCase()
    if (normalized.length === 0 || normalized.length === 2) {
      setFilter("countryCode", normalized || null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-normal tracking-tight">System Audit Logs</h2>
        <p className="mt-1 text-sm text-muted-foreground">Immutable security and administrative events with approximate request locations.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search || ""}
          onChange={setSearch}
          placeholder="Search actor, action, or summary"
          className="min-w-[260px]"
        />
        <SearchInput
          value={location || ""}
          onChange={(value) => setFilter("location", value || null)}
          placeholder="Filter city, region, or country"
          className="min-w-[260px]"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={filtersActive ? "default" : "outline"}
              className={cn(
                "shrink-0 gap-2 border-2 px-6 text-base font-medium",
                !filtersActive && "border-black/10 bg-white text-foreground hover:bg-gray-50",
              )}
            >
              <Filter className="h-4 w-4" />
              Filters {filtersActive ? "(Active)" : ""}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-[70vh] w-[90vw] max-w-[640px] overflow-y-auto p-0">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 p-3 backdrop-blur">
              <span className="text-sm font-semibold">Filter options</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCountryDraft("")
                  setFilters({ action: null, actorRole: null, search: null, location: null, countryCode: null })
                }}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                disabled={!filtersActive && !search}
              >
                Clear all
              </Button>
            </div>

            <div className="space-y-5 p-3">
              <div>
                <DropdownMenuLabel className="px-0 pb-2 pt-0 text-xs uppercase tracking-wider text-muted-foreground">
                  Country code
                </DropdownMenuLabel>
                <Input
                  value={countryDraft}
                  maxLength={2}
                  placeholder="PH"
                  aria-label="Country code"
                  className="max-w-32 uppercase"
                  onChange={(event) => setCountryDraft(event.target.value.replace(/[^a-z]/gi, "").toUpperCase())}
                  onBlur={commitCountryFilter}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      commitCountryFilter()
                    }
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">Use a two-letter ISO country code.</p>
              </div>

              <DropdownMenuSeparator />
              <div>
                <DropdownMenuLabel className="px-0 pb-2 pt-0 text-xs uppercase tracking-wider text-muted-foreground">
                  Actor role
                </DropdownMenuLabel>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {ROLES.map((role) => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={actorRole === role}
                      onCheckedChange={() => setFilter("actorRole", actorRole === role ? null : role)}
                      className="text-xs"
                    >
                      {role.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </div>

              <DropdownMenuSeparator />
              <div>
                <DropdownMenuLabel className="px-0 pb-2 pt-0 text-xs uppercase tracking-wider text-muted-foreground">
                  Action
                </DropdownMenuLabel>
                <div className="space-y-4">
                  {Object.entries(ACTION_GROUPS).map(([category, actions]) => (
                    <div key={category}>
                      <span className="mb-1 block px-2 text-xs font-medium text-foreground">{category}</span>
                      <div className="ml-2 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                        {actions.map((auditAction) => (
                          <DropdownMenuCheckboxItem
                            key={auditAction}
                            checked={action === auditAction}
                            onCheckedChange={() => setFilter("action", action === auditAction ? null : auditAction)}
                            className="text-xs"
                          >
                            {auditAction.replace(/_/g, " ")}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isError ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Audit logs could not be loaded</AlertTitle>
          <AlertDescription>
            <p>{error || "The audit service is temporarily unavailable."}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Try again</Button>
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <AuditLogTableSkeleton />
      ) : (
        <AuditLogTable
          logs={auditLogs}
          sortConfig={sortConfig}
          requestSort={requestSort}
          onSelectLog={setSelectedLog}
        />
      )}

      {!isError && !isLoading && (pagination?.totalPages || 0) > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination?.page || 1}
            totalPages={pagination?.totalPages || 1}
            onPageChange={setPage}
          />
        </div>
      )}

      <AuditLogDetailsDialog log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  )
}
