# Compliance Services

Audit log access, blockchain ledger verification, and terms & conditions management.

---

## `AuditService` — `services/audit.service.ts`

Provides access to the immutable audit trail of all user actions in the system.

> [!IMPORTANT]
> Only accessible by `SUPER_ADMIN`. All other roles receive a `403` from the backend.

### Types

See `AuditLog` and `AuditLogQuery` in [`lib/types/index.ts`](../../lib/types/types.md).

Key fields on `AuditLog`:
- `actorId` / `actor` — who performed the action
- `action` — one of the `AuditActions` enum values
- `summary` — human-readable description
- `metadata` — structured context data (varies by action)
- `ip` / `userAgent` — request origin
- `isArchived` — whether the log has been archived

### `AuditActions` Enum (selected)

| Value | Meaning |
|-------|---------|
| `LOGIN_SUCCESS` | User logged in successfully |
| `ACCOUNT_LOCKED` | Account locked after failed attempts |
| `USER_CREATED` / `USER_DISABLED` | User management events |
| `INVOICE_UPLOADED` / `INVOICE_FLAGGED` | Invoice pipeline events |
| `REVIEW_SUBMITTED` / `REVIEW_UPDATED` | Auditor review events |
| `ASSIGNMENT_CREATED` | Auditor-company link created |
| `POLICY_CREATED` / `TERMS_CREATED` | Compliance document events |
| `ARCHIVE_EXECUTED` | Audit log archival run |

### Methods

#### `getLogs(params?)`
```ts
AuditService.getLogs(params?: AuditLogQuery): Promise<PaginatedResponse<AuditLog>>
```
`GET /audit-logs` — Returns paginated audit logs.

> [!NOTE]
> The `sortBy` param is always stripped before the request — the backend only supports `createdAt` ordering and ignores any other sort key. Pass `order: 'asc' | 'desc'` to control direction.

Filter params via `AuditLogQuery`:
```ts
{ action?, actorRole?, from?: string, to?: string }  // ISO date strings for range filter
```

#### `getLogById(id)`
```ts
AuditService.getLogById(id: string): Promise<{ ok: boolean; data: AuditLog }>
```
`GET /audit-logs/:id` — Returns a single audit log entry with full metadata.

---

## `blockchainService` — `services/blockchain.service.ts`

Fetches the on-chain ledger of anchored invoices.

### Types

```ts
interface LedgerInvoice {
  id: string
  invoiceNumber: string
  company: string
  transactionHash: string
  anchoredAt: string
  status: string
}

type LedgerSortBy = 'anchoredAt' | 'invoiceNumber'
```

### Methods

#### `getLedger(params?)`
```ts
blockchainService.getLedger(params?: LedgerParams): Promise<PaginatedResponse<LedgerInvoice>>
```
`GET /blockchain/ledger` — Returns invoices that have been anchored to the blockchain.

Only `anchoredAt` and `invoiceNumber` are valid `sortBy` values — any other value is silently removed before the request.

> [!NOTE]
> Note the lowercase export name: `blockchainService` (not `BlockchainService`). The type alias `BlockchainLedgerItem = LedgerInvoice` is exported for backward compatibility.

---

## `termsService` — `services/terms.service.ts`

CRUD for Terms & Conditions documents. Structured identically to `policyService`.

### Types

```ts
interface Terms {
  id: string
  title: string
  content: string
  version: string
  createdByUserId: string
  updatedByUserId: string
  createdAt: string
  updatedAt: string
}
```

### Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAllTerms(params?)` | `GET /terms` | All T&C documents (search + pagination) |
| `createTerms(data)` | `POST /terms` | Create a new T&C document |
| `updateTerms(id, data)` | `PATCH /terms/:id` | Partial update |
| `deleteTerms(id)` | `DELETE /terms/:id` | Permanent delete |
