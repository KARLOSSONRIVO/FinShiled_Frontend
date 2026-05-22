"use client"

import { useState, useMemo, useCallback, useEffect } from "react"

interface UseSearchFilterOptions<T> {
    items: T[]
    searchFields: (keyof T)[]
    statusField?: keyof T
    defaultStatus?: string
    storageKey?: string
}

interface UseSearchFilterReturn<T> {
    search: string
    setSearch: (value: string) => void
    statusFilter: string
    setStatusFilter: (value: string) => void
    filteredItems: T[]
    resultCount: number
    clearFilters: () => void
    hasActiveFilters: boolean
}

export function useSearchFilter<T extends Record<string, any>>({
    items,
    searchFields,
    statusField,
    defaultStatus = "all",
    storageKey,
}: UseSearchFilterOptions<T>): UseSearchFilterReturn<T> {
    const [search, setSearchState] = useState("")
    const [statusFilter, setStatusFilterState] = useState(defaultStatus)

    useEffect(() => {
        if (storageKey) {
            const savedSearch = localStorage.getItem(`${storageKey}_search`)
            const savedStatus = localStorage.getItem(`${storageKey}_status`)
            if (savedSearch !== null) setSearchState(savedSearch)
            if (savedStatus !== null) setStatusFilterState(savedStatus)
        }
    }, [storageKey])

    const setSearch = useCallback((val: string) => {
        setSearchState(val)
        if (storageKey) {
            localStorage.setItem(`${storageKey}_search`, val)
        }
    }, [storageKey])

    const setStatusFilter = useCallback((val: string) => {
        setStatusFilterState(val)
        if (storageKey) {
            localStorage.setItem(`${storageKey}_status`, val)
        }
    }, [storageKey])

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            // Search filter - check all specified search fields
            const matchesSearch =
                search === "" ||
                searchFields.some((field) => {
                    const value = item[field]
                    if (typeof value === "string") {
                        return value.toLowerCase().includes(search.toLowerCase())
                    }
                    if (typeof value === "number") {
                        return value.toString().includes(search)
                    }
                    return false
                })

            // Status filter
            const matchesStatus =
                !statusField ||
                statusFilter === "all" ||
                statusFilter === defaultStatus ||
                item[statusField] === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [items, search, statusFilter, searchFields, statusField, defaultStatus])

    const clearFilters = useCallback(() => {
        setSearchState("")
        setStatusFilterState(defaultStatus)
        if (storageKey) {
            localStorage.removeItem(`${storageKey}_search`)
            localStorage.removeItem(`${storageKey}_status`)
        }
    }, [defaultStatus, storageKey])

    const hasActiveFilters = search !== "" || statusFilter !== defaultStatus

    return {
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        filteredItems,
        resultCount: filteredItems.length,
        clearFilters,
        hasActiveFilters,
    }
}

// Convenience hook for invoice filtering (commonly used pattern)
export function useInvoiceFilter<
    T extends { invoiceNo: string; status: string }
>(invoices: T[], storageKey = "finshield_invoice_filter") {
    return useSearchFilter({
        items: invoices,
        searchFields: ["invoiceNo"],
        statusField: "status",
        storageKey,
    })
}

// Convenience hook for user filtering
export function useUserFilter<
    T extends { username: string; email: string; role?: string }
>(users: T[], storageKey = "finshield_user_filter") {
    return useSearchFilter({
        items: users,
        searchFields: ["username", "email"],
        statusField: "role",
        storageKey,
    })
}
