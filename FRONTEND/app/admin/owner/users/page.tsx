"use client"

import { Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/components/users/UserTable"
import { useUsers } from "@/hooks/users/use-owner-users"
import { CreateUserDialog } from "@/components/users/CreateUserDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { UserTableSkeleton } from "@/components/skeletons/user-table-skeleton"
import { CompanyEmployeesTable } from "@/components/users/CompanyEmployeesTable"
import { SearchInput } from "@/components/common/SearchInput"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PlatformUsersPage() {
  const {
    search,
    setSearch,
    users,
    pagination,
    setPage,
    sortConfig,
    requestSort,
    isCreateOpen,
    setIsCreateOpen,
    newUser,
    setNewUser,
    organizations,
    handleCreateUser,
    handleUpdateStatus,
    handleRegenerateTemporaryPassword,
    isRegeneratingTemporaryPassword,
    isCreating,
    roleFilter,
    setRoleFilter,
    organizationFilter,
    setOrganizationFilter,
    statusFilter,
    setStatusFilter,
    handleAssignRole,
    isLoading
  } = useUsers({ initialLimit: 5 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-normal tracking-tight">User Management</h2>
        <Button
          disabled={isCreating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create User
        </Button>
      </div>

      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        newUser={newUser}
        setNewUser={setNewUser}
        organizations={organizations}
        onCreateUser={handleCreateUser}
        isLoading={isCreating}
      />

      <div className="flex flex-col gap-4">

        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_220px_160px_auto]">
          <SearchInput
            value={search || ""}
            onChange={setSearch}
            placeholder="Search by username or email..."
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger aria-label="Filter users by role"><SelectValue placeholder="All roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="COMPANY_MANAGER">Company Manager</SelectItem>
              <SelectItem value="COMPANY_USER">Company User</SelectItem>
              <SelectItem value="AUDITOR">Auditor</SelectItem>
              <SelectItem value="REGULATOR">Regulator</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
            </SelectContent>
          </Select>
          <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
            <SelectTrigger aria-label="Filter users by organization"><SelectValue placeholder="All organizations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organizations.map(org => <SelectItem key={org.id || org._id} value={org.id || org._id || ""}>{org.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Filter users by account status"><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 border-2 border-black/10 text-base px-6">
                <Filter className="h-4 w-4" />
                Filter & Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => requestSort('createdAt', 'desc')}>
                <span className={sortConfig?.key === 'createdAt' && sortConfig?.direction === 'desc' ? "font-bold text-primary" : ""}>Date Created (New - Old)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => requestSort('createdAt', 'asc')}>
                <span className={sortConfig?.key === 'createdAt' && sortConfig?.direction === 'asc' ? "font-bold text-primary" : ""}>Date Created (Old - New)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <UserTableSkeleton />
      ) : (
        <UserTable
          users={users}
          onUpdateStatus={handleUpdateStatus}
          onRegenerateTemporaryPassword={handleRegenerateTemporaryPassword}
          onAssignRole={handleAssignRole}
          organizations={organizations}
          pagination={pagination}
          onPageChange={setPage}
          sortBy={sortConfig?.key}
          order={sortConfig?.direction as "asc" | "desc" | undefined}
          onSort={(field) => requestSort(field)}
          renderSubComponent={(user) => {
            if (user.role === 'COMPANY_MANAGER' && user.employees) {
              return <CompanyEmployeesTable employees={user.employees} />
            }
            return null
          }}
        />
      )}
    </div>
  )
}
