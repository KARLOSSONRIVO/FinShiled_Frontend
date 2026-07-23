# Type Definitions

**Files:** `lib/types/primitives.ts` · `lib/types/invoice.ts` · `lib/types/user.ts` · `lib/types/organization.ts` · `lib/types/index.ts`

All types are re-exported from `@/lib/types` — import everything from there.

> [!WARNING]
> `lib/api-types.ts` is **auto-generated** from the backend OpenAPI spec using `openapi-typescript`. Do not edit it manually — it will be overwritten on the next generation run.

---

## Primitive / Enum Types — `primitives.ts`

### Status & Verdict

```ts
type AIVerdict     = 'clean' | 'flagged'
type InvoiceStatus = 'pending' | 'clean' | 'flagged' | 'anchored' | 'accepted' | 'rejected'
type ReviewDecision = 'approved' | 'rejected'

// UI filter values (includes 'all' sentinel)
type StatusFilter    = 'all' | 'pending' | 'clean' | 'flagged' | 'anchored' | 'accepted' | 'rejected' | 'approved'
type AiVerdictFilter = 'all' | 'clean' | 'flagged' | 'pending'
```

### Organization

```ts
type OrganizationType   = 'PLATFORM' | 'COMPANY' | 'AUDITOR' | 'REGULATOR'
type OrganizationStatus = 'ACTIVE' | 'INACTIVE'
type AssignmentStatus   = 'ACTIVE' | 'INACTIVE'
type EntityType         = 'organization' | 'user' | 'assignment' | 'invoice' | 'review'
```

### Pagination

```ts
interface PaginationDetails {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface PaginatedResponse<T> {
  ok: boolean
  data: {
    items: T[]
    pagination: PaginationDetails
  }
}

interface PaginationQuery {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  [key: string]: any
}
```

---

## Invoice Types — `invoice.ts`

| Type | Used for |
|------|---------|
| `ListInvoice` | Invoice rows in admin/manager/auditor/regulator list views |
| `MyInvoice` | Invoice rows in the employee "my invoices" view (subset of fields) |
| `InvoiceDetail` | Full invoice detail page (includes AI analysis + blockchain + review) |
| `ReviewPayload` | Request body for `InvoiceService.submitReview()` |
| `ReviewResponse` | Response from `submitReview()` — includes `isUpdate` flag |
| `LedgerInvoice` | Row in the blockchain ledger view |
| `Invoice` | Alias for `ListInvoice` (primary invoice type) |

### Key field notes
- `id` and `_id` are both present for backward compatibility (some API responses use `_id`)
- Date fields vary: `date`, `invoiceDate`, `uploadedAt`, `createdAt` — always check all four when parsing dates
- `aiVerdict` (object form) vs `ai_verdict` (string form) — both exist, prefer the object form

---

## User Types — `user.ts`

```ts
interface User extends SchemaUser {
  role: string               // Required (non-nullable override)
  status: string             // Required (non-nullable override)
  _id: string                // Legacy ID field
  orgId: string | { _id: string; name: string }  // Can be populated or a raw ID
  organizationName?: string
  lastLoginAt?: string
  employees?: User[]         // Present for COMPANY_MANAGER
  disabledByUserId?: string
  disabledAt?: string
  disableReason?: string
}

type Role       = User['role']    // 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'AUDITOR' | 'REGULATOR' | 'COMPANY_MANAGER' | 'COMPANY_USER'
type UserStatus = User['status']  // 'active' | 'disabled'
```

> [!NOTE]
> `FrontendUser` is deprecated — use `User` directly.

---

## Aggregate Types — `index.ts`

### `CompanyAssignment`

Links an auditor organization to a company organization. Populated fields from the backend mapper include nested `company`, `auditor`, and `assignedBy` objects.

```ts
interface CompanyAssignment {
  auditorOrgId: string
  companyOrgId: string
  status: AssignmentStatus
  company?: Partial<Organization>
  auditor?: Partial<User>
  assignedBy?: Partial<User>
  notes?: string
  dueDate?: string
}
```

### `AuditLog`

See [compliance service docs](../../services/compliance/compliance.md) for the full `AuditLog` interface and `AuditActions` enum reference.

### `Review`

```ts
interface Review {
  invoiceId: string
  companyOrgId: string
  reviewedByUserId: string
  decision: ReviewDecision  // 'approved' | 'rejected'
  notes?: string
  createdAt: string
  reviewerName?: string
}
```
