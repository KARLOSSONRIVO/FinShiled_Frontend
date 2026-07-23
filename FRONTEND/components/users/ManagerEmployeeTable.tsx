"use client"

import { UserTable } from "./UserTable"
import { User } from "@/lib/types"

interface ManagerEmployeeTableProps {
    users: User[]
    sortConfig: any
    onSort: (key: any) => void
    onUpdateStatus: (userId: string, status: "ACTIVE" | "INACTIVE", reason?: string) => void
    onRegenerateTemporaryPassword: (userId: string) => void
    isRegeneratingTemporaryPassword?: boolean
}

export function ManagerEmployeeTable({ users, sortConfig, onSort, onUpdateStatus, onRegenerateTemporaryPassword, isRegeneratingTemporaryPassword }: ManagerEmployeeTableProps) {
    return (
        <UserTable
            users={users}
            sortBy={sortConfig?.key}
            order={sortConfig?.direction}
            onSort={onSort}
            hideRoleAndOrg={true}
            onUpdateStatus={onUpdateStatus}
            onRegenerateTemporaryPassword={onRegenerateTemporaryPassword}
            isRegeneratingTemporaryPassword={isRegeneratingTemporaryPassword}
        />
    )
}
