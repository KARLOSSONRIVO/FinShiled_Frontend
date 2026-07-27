"use client"

import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useUrlPagination } from "@/hooks/common/use-url-pagination"
import type { AuditLogQuery } from "@/lib/types"
import { AuditService } from "@/services/audit.service"

const AUDIT_SORT_FIELDS = ["createdAt", "action", "actorRole", "country"] as const
type AuditSortField = (typeof AUDIT_SORT_FIELDS)[number]

function normalizeAuditSortField(value?: string): AuditSortField | undefined {
    return AUDIT_SORT_FIELDS.includes(value as AuditSortField)
        ? value as AuditSortField
        : undefined
}

export function useAuditLogs() {
    const {
        page,
        search,
        setSearch,
        queryParams,
        setPage,
        setSort,
        setFilter,
        setFilters,
    } = useUrlPagination(8)

    const searchParams = useSearchParams()
    const from = searchParams.get("from") || undefined
    const to = searchParams.get("to") || undefined
    const action = searchParams.get("action") || undefined
    const actorRole = searchParams.get("actorRole") || undefined
    const location = searchParams.get("location") || undefined
    const countryCode = searchParams.get("countryCode") || undefined
    const sortBy = normalizeAuditSortField(queryParams.sortBy)

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["audit-logs", queryParams, from, to, action, actorRole, location, countryCode],
        queryFn: () => {
            const fetchParams: AuditLogQuery = {
                ...queryParams,
                sortBy,
                ...(from && { from }),
                ...(to && { to }),
                ...(action && { action }),
                ...(actorRole && { actorRole }),
                ...(location && { location }),
                ...(countryCode && { countryCode }),
            }
            return AuditService.getLogs(fetchParams)
        },
    })

    const pagination = data ? {
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
    } : undefined

    return {
        auditLogs: data?.items || [],
        pagination,
        isLoading,
        isError,
        error: error instanceof Error ? error.message : null,
        page,
        setPage,
        search,
        setSearch,
        sortConfig: sortBy
            ? { key: sortBy, direction: (queryParams.order || "desc") as "asc" | "desc" }
            : { key: "createdAt", direction: "desc" as const },
        requestSort: setSort,
        action,
        actorRole,
        location,
        countryCode,
        from,
        to,
        setFilter,
        setFilters,
        refetch,
    }
}
