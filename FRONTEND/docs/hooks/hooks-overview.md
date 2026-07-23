# Hooks — Documentation

Custom React hooks abstract **all state management and data fetching** away from UI components.
They consume services from `services/` and expose clean, typed interfaces to components.

## Design Principles

- **Hooks never call `apiClient` directly** — they always go through a `Service`.
- **All server state** is managed via `useQuery` / `useMutation` (TanStack Query).
- **All local UI state** (filters, pagination, sort) lives in the hook, not the component.
- **Hooks are grouped by role** — a component manager hook won't be used in employee screens.

## Hooks Index

| Folder | Role | Description |
|--------|------|-------------|
| [company-employee.md](./company-employee.md) | COMPANY_USER | Invoice list, flagged items, employee dashboard |
| [company-manager.md](./company-manager.md) | COMPANY_MANAGER | Invoice management, team overview, manager dashboard |
| [auditor.md](./auditor.md) | AUDITOR | Assigned company invoices, audit review workflows |
| [regulator.md](./regulator.md) | REGULATOR | Cross-org regulatory views |
| [super-admin.md](./super-admin.md) | SUPER_ADMIN | System-wide admin operations |
| [auth.md](./auth.md) | All | `useAuthContext`, MFA hooks |
| [common.md](./common.md) | All | Shared hooks used across roles |
| [filters.md](./filters.md) | — | Reusable filter state hooks |
| [upload.md](./upload.md) | COMPANY_USER, COMPANY_MANAGER | File upload state & progress |

## Common Hook Return Shape

Most data hooks return a consistent shape:

```ts
{
  // Data
  items: T[]
  pagination: { total, page, limit, totalPages }

  // Loading/error states
  isLoading: boolean
  isError: boolean
  error: string | null

  // Filters & sorting
  search: string
  setSearch: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
  // ... other filters

  // Pagination
  setPage: (page: number) => void

  // Sort
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null
  requestSort: (key: string, direction?: 'asc' | 'desc') => void

  // Utilities
  resetFilters: () => void
  hasActiveFilters: boolean
}
```
