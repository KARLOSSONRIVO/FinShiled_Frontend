"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserService } from "@/services/user.service"
import { OrganizationService } from "@/services/organization.service"
import { User as FrontendUser, Organization, OrganizationType, OrganizationStatus } from "@/lib/types"
import { toast } from "sonner"
import { useUrlPagination } from "../common/use-url-pagination"
import { useSearchParams } from "next/navigation"

export function useUsers({ isEmployeesOnly = false, initialLimit = 5 } = {}) {
    const queryClient = useQueryClient()
    const searchParams = useSearchParams()
    const {
        page, limit, search, sortBy, order, queryParams,
        setPage, setSearch, setSort, setFilter
    } = useUrlPagination(initialLimit)

    const roleFilter = searchParams.get("role") || "all"
    const organizationFilter = searchParams.get("orgId") || "all"
    const statusFilter = searchParams.get("status") || "all"

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

    // Fetch Organizations for dropdown
    const { data: realOrganizations = [] } = useQuery<Organization[]>({
        queryKey: ["organizations"],
        queryFn: async () => {
            const response = await OrganizationService.listOrganizations()
            // @ts-ignore
            const orgs = response.data?.items || response.data || []
            return orgs.map((o: any) => ({
                id: o.id || o._id || "",
                _id: o.id || o._id || "",
                name: o.name || "",
                type: (o.type?.toUpperCase() || "COMPANY") as OrganizationType,
                status: (o.status?.toUpperCase() || "ACTIVE") as OrganizationStatus,
                employees: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Organization))
        }
    })

    type NewUserState = {
        email: string
        username: string
        role: string
        orgId: string
    }

    const [newUser, setNewUser] = useState<NewUserState>({
        email: "",
        username: "",
        role: "",
        orgId: ""
    })

    // Fetch Users from API
    const { data, isLoading, isError } = useQuery({
        queryKey: ["users", queryParams, roleFilter, organizationFilter, statusFilter, isEmployeesOnly],
        queryFn: async () => {
            const fetchFn = isEmployeesOnly ? UserService.listEmployees : UserService.listUsers

            const apiParams = {
                ...queryParams,
                role: roleFilter === "all" ? undefined : roleFilter,
                orgId: organizationFilter === "all" ? undefined : organizationFilter,
                status: statusFilter === "all" ? undefined : statusFilter,
            } as any

            const allowedSortKeys = ["createdAt", "username", "email", "role", "lastLoginAt"]
            const fetchParams = {
                ...apiParams,
                sortBy: apiParams.sortBy && allowedSortKeys.includes(apiParams.sortBy) ? apiParams.sortBy : undefined
            }

            const response = await fetchFn(fetchParams)

            let rawItems = response.data?.items || []

            // Map users to have organization names
            const mappedUsers = rawItems.map((u: any) => {
                let orgName = "FinShield"
                const org = realOrganizations.find(o => (o as any).id === u.orgId || o._id === u.orgId)
                if (org) orgName = org.name || "FinShield"
                else if (u.orgId === "org-platform") orgName = "FinShield Platform"

                return {
                    ...u,
                    _id: String(u.id || u._id || ""),
                    organizationName: orgName
                }
            }) as FrontendUser[]

            return {
                items: mappedUsers,
                pagination: response.data.pagination
            }
        },
        enabled: !!realOrganizations.length || realOrganizations.length === 0,
    })

    // Create User Mutation
    const createUserMutation = useMutation({
        mutationFn: async () => {
            setCreateError(null)
            if (["COMPANY_MANAGER", "COMPANY_USER"].includes(newUser.role) && !newUser.orgId) {
                throw new Error("Company is required for this role");
            }

            const payload = {
                email: newUser.email,
                username: newUser.username,
                role: newUser.role as any,
                orgId: (newUser.orgId || "").trim() || undefined
            }
            return await UserService.createUser(payload)
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            if (response.data.welcomeEmail.status === 'sent') {
                toast.success('User created and welcome email sent')
            } else {
                toast.warning('User created, but email delivery failed. Use Generate new temporary password to retry.')
            }
            setIsCreateOpen(false)
            setNewUser({ email: "", username: "", role: "", orgId: "" })
            setCreateError(null)
        },
        onError: (error: any) => {
            const msg = error.response?.data?.message || error.message || "Failed to create user"
            setCreateError(msg)
            toast.error(msg)
        }
    })

    const regenerateMutation = useMutation({
        mutationFn: ({ userId, confirmation }: { userId: string; confirmation: string }) => UserService.regenerateTemporaryPassword(userId, confirmation),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            if (response.data.welcomeEmail.status === 'sent') {
                toast.success('New temporary password generated and welcome email sent')
            } else {
                toast.warning('Temporary password changed, but email delivery failed. Wait before retrying.')
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || 'Could not regenerate the temporary password')
        },
    })

    // Update User Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, reason, confirmation }: { id: string; status: "ACTIVE" | "INACTIVE"; reason?: string; confirmation: string }) => {
            const apiStatus = status === "INACTIVE" ? "disabled" : "active"
            const apiReason = status === "INACTIVE" ? reason : undefined
            return await UserService.updateUserStatus(id, apiStatus, confirmation, apiReason)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User status updated")
        },
        onError: (error: any) => {
            toast.error("Failed to update user status: " + (error.response?.data?.message || error.message))
        }
    })

    const assignRoleMutation = useMutation({
        mutationFn: ({ id, role, confirmation, orgId }: { id: string; role: "AUDITOR" | "REGULATOR" | "COMPANY_MANAGER" | "COMPANY_USER"; confirmation: string; orgId?: string }) =>
            UserService.assignRole(id, role, confirmation, orgId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] })
            toast.success("User role updated. Existing sessions were invalidated.")
        },
        onError: (error: any) => toast.error(error.response?.data?.message || error.message || "Could not update role"),
    })

    return {
        // Table Data & Pagination
        users: data?.items || [],
        pagination: data?.pagination,
        isLoading,
        isError,

        // URL Pagination Handlers
        search,
        setSearch,
        setPage,
        sortConfig: sortBy ? { key: sortBy, direction: order || 'asc' } : null,
        requestSort: setSort,

        // Filters
        roleFilter,
        setRoleFilter: (val: string) => setFilter('role', val === 'all' ? undefined : val),
        organizationFilter,
        setOrganizationFilter: (val: string) => setFilter('orgId', val === 'all' ? undefined : val),
        statusFilter,
        setStatusFilter: (val: string) => setFilter('status', val === 'all' ? undefined : val),

        // Create
        isCreateOpen,
        setIsCreateOpen,
        newUser,
        setNewUser,
        handleCreateUser: () => createUserMutation.mutate(),
        isCreating: createUserMutation.isPending,
        handleRegenerateTemporaryPassword: (userId: string, confirmation: string) => regenerateMutation.mutate({ userId, confirmation }),
        isRegeneratingTemporaryPassword: regenerateMutation.isPending,
        createError,
        setCreateError,

        // Status Update
        handleUpdateStatus: (userId: string, status: "ACTIVE" | "INACTIVE", reason: string | undefined, confirmation: string) =>
            updateStatusMutation.mutate({ id: userId, status, reason, confirmation }),
        isUpdatingStatus: updateStatusMutation.isPending,
        handleAssignRole: (id: string, role: "AUDITOR" | "REGULATOR" | "COMPANY_MANAGER" | "COMPANY_USER", confirmation: string, orgId?: string) =>
            assignRoleMutation.mutate({ id, role, confirmation, orgId }),
        isAssigningRole: assignRoleMutation.isPending,

        // Context Data
        organizations: realOrganizations,
    }
}
