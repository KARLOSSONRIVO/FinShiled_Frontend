# Finance Services

Invoice management and dashboard statistics. These services power the core financial workflows of FinShield.

---

## `InvoiceService` — `services/invoice.service.ts`

### Allowed Sort Fields

```ts
// For list() and myInvoices()
['createdAt', 'invoiceNumber', 'invoiceDate', 'totalAmount', 'reviewDecision']
```

Invalid `sortBy` values are silently stripped before the request to prevent `400` errors.

### Methods

#### `list(params?)`
```ts
InvoiceService.list(params?: PaginationQuery & { orgId?: string }): Promise<PaginatedResponse<ListInvoice>>
```
`GET /invoice/list` — Fetches all invoices. Server-side scoping applies per role:
- `SUPER_ADMIN` / `REGULATOR` → all invoices
- `AUDITOR` → only invoices belonging to assigned companies
- `COMPANY_MANAGER` → only their company's invoices

If `limit` is omitted, the `page` param is also dropped — this triggers a "fetch all" pattern used for client-side filtering.

**Fallback behaviour:** If the API returns 0 items or a `400`/`403` (e.g. auditor with no assignments), `fallbackList()` is called without auth headers as a UI-testing escape hatch.

---

#### `fallbackList(params)`
```ts
InvoiceService.fallbackList(params): Promise<PaginatedResponse<ListInvoice> | null>
```
Internal helper. Retries `GET /invoice/list` with an empty `Authorization` header. Returns `null` if the fallback also fails. Not intended to be called directly.

---

#### `myInvoices(params?)`
```ts
InvoiceService.myInvoices(params?: PaginationQuery): Promise<PaginatedResponse<MyInvoice>>
```
`GET /invoice/my-invoices` — Returns only invoices uploaded by the currently authenticated `COMPANY_USER`. Not accessible by other roles.

---

#### `getById(id)`
```ts
InvoiceService.getById(id: string): Promise<{ ok: boolean; data: InvoiceDetail }>
```
`GET /invoice/:id` — Returns full invoice detail including AI analysis, blockchain anchor info, and review history. Access is role-scoped on the server.

---

#### `upload(file)`
```ts
InvoiceService.upload(file: File): Promise<{ success: boolean; data: any }>
```
`POST /invoice/upload` — Uploads an invoice PDF/image as `multipart/form-data`. The `Content-Type` header is deleted before the request so the browser sets it automatically (required by `multer` for proper boundary detection).

Available to `COMPANY_MANAGER` and `COMPANY_USER` roles.

---

#### `submitReview(id, payload)`
```ts
InvoiceService.submitReview(id: string, payload: ReviewPayload): Promise<{ ok: boolean; data: ReviewResponse }>
```
`PATCH /invoice/:id/review` — Submits or overwrites an auditor review decision. Response includes `isUpdate: true` when overwriting an existing review.

Only accessible by `AUDITOR` role for their assigned companies.

```ts
// ReviewPayload
{ reviewDecision: 'approved' | 'rejected'; reviewNotes: string }

// ReviewResponse
{ invoiceId, reviewDecision, reviewNotes, reviewedAt, isUpdate: boolean }
```

---

## `DashboardService` — `services/dashboard.service.ts`

Aggregates stats for role-specific dashboards. Most methods compose data from other services rather than calling a dedicated `/dashboard` endpoint.

### `DashboardStats` interface

```ts
interface DashboardStats {
  totalRevenue: number
  activeInvoices: number
  flaggedInvoices: number
  verifiedInvoices: number
  totalUsers?: number        // Super admin only
  totalCompanies?: number    // Super admin / regulator
  pendingReviews?: number    // Auditor only
  flaggedCount?: number      // Regulator only
  verifiedOnChain?: number   // Regulator only
  totalValue?: number        // Regulator only
}
```

### Methods

| Method | Role | Data Source |
|--------|------|-------------|
| `getSuperAdminStats()` | SUPER_ADMIN | Composes from `UserService.listUsers()` + `OrganizationService.listOrganizations()` |
| `getCompanyStats()` | COMPANY_MANAGER | Placeholder — returns zeroed stats |
| `getAuditorStats()` | AUDITOR | Placeholder — returns zeroed stats |
| `getRegulatorStats()` | REGULATOR | Placeholder — returns zeroed stats |
| `getRecentLogs()` | SUPER_ADMIN | Delegates to `AuditService.getLogs({ limit: 6, order: 'desc' })` |

> [!WARNING]
> `getCompanyStats()`, `getAuditorStats()`, and `getRegulatorStats()` currently return **zeroed placeholder data**. Real implementations are pending backend dashboard endpoints.
