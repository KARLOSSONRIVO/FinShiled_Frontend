# Role-Based Hooks

All hooks in this group are scoped to a specific user role. A component rendered in the employee portal should only use employee hooks, never manager or admin hooks.

---

## Pattern Common to All Role Hooks

Every data hook in this group follows the same structure:

1. **Fetches all data once** via `useQuery` (no server-side pagination)
2. **Applies all filtering, sorting, and pagination client-side** using `useMemo`
3. **Resets page to 1** whenever any filter or sort changes
4. **Exposes mutually exclusive filters** where applicable (e.g. `statusFilter` and `aiVerdictFilter` clear each other)

### Standard Return Shape

```ts
{
  // Paginated data slice
  invoices: T[]          // or items, whatever the domain entity is
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }

  // Loading / error
  isLoading: boolean
  isError: boolean
  error: string | null

  // Search
  search: string
  setSearch: (val: string) => void   // resets page to 1

  // Filters
  statusFilter: string
  setStatusFilter: (val: string) => void
  aiVerdictFilter: string
  setAiVerdictFilter: (val: string) => void
  dateRange: DateRange | undefined
  setDateRange: (val: DateRange | undefined) => void
  monthFilter: string
  setMonthFilter: (val: string) => void
  yearFilter: string
  setYearFilter: (val: string) => void
  availableYears: number[]           // derived from data

  // Sort
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null
  requestSort: (key: string, direction?: 'asc' | 'desc') => void

  // Pagination control
  setPage: (page: number) => void

  // Utilities
  resetFilters: () => void
  hasActiveFilters: boolean
}
```

---

## `useEmployeeInvoices` — `hooks/company-employee/invoices/use-employee-invoices.ts`

**Role:** `COMPANY_USER`

Fetches all invoices uploaded by the current employee (`InvoiceService.myInvoices()`), then handles all filtering/sorting/pagination client-side.

### Query Key
```ts
['invoices', 'employee']
```

### Page Size
`LIMIT = 7` items per page.

### Filter Behaviour

- **`setSearch(val)`** — filters by `invoiceNumber` or `companyName` (case-insensitive)
- **`setStatusFilter(val)`** — when set to non-`'all'`, clears `aiVerdictFilter`
- **`setAiVerdictFilter(val)`** — when set to non-`'all'`, clears `statusFilter`
- **`setDateRange(val)`** — filters by any available date field (`date`, `invoiceDate`, `uploadedAt`, `createdAt`), inclusive of `to` date end-of-day
- **`setMonthFilter` / `setYearFilter`** — independent month/year filters (separate from date range)

### Sort Behaviour

`requestSort(key, direction?)`:
- Called with `direction` → sets sort explicitly
- Called without `direction` on same key → toggles `asc` → `desc` → cleared
- Called on different key → sets that key ascending

Date fields normalised: `invoiceDate`, `createdAt`, `date`, `uploadedAt` all resolve to the first non-null date value across those four fields.

`reviewDecision` sort key maps internally to `status`.

---

## `useEmployeeFlagged` — `hooks/company-employee/use-employee-flagged.ts`

**Role:** `COMPANY_USER`

Fetches the employee's flagged invoices (AI verdict = `'flagged'`), with the same filter/sort/pagination pattern as `useEmployeeInvoices`.

---

## Other Role Hook Groups

The following role groups follow the same pattern as above. Their hook files live in the corresponding subdirectory of `hooks/`:

| Role | Hook Directory | Key Data |
|------|---------------|----------|
| `COMPANY_MANAGER` | `hooks/company-manager/` | All company invoices, employee list, company stats |
| `AUDITOR` | `hooks/auditor/` | Assigned-company invoices, review management |
| `REGULATOR` | `hooks/regulator/` | Cross-org invoice views, blockchain ledger |
| `SUPER_ADMIN` | `hooks/super-admin/` | All users, all orgs, all assignments, audit logs |
