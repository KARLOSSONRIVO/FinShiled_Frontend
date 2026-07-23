# Compliance Components

**Directory:** `components/audit-logs/` · `components/policy/` · `components/blockchain/`

Audit trail viewing, compliance policy management, and blockchain verification UI.

---

## Audit Log Components — `components/audit-logs/`

### Audit Log Table
Paginated, filterable table of all system audit events. Only accessible by `SUPER_ADMIN`.

Calls `AuditService.getLogs()` via hook.

**Columns:** Actor, Role, Action, Summary, IP, Date

**Filters:**
- Action type dropdown (from `AuditActions` enum)
- Actor role dropdown
- Date range picker (maps to `from` / `to` ISO strings on `AuditLogQuery`)

**Row expand / detail:** Clicking a row opens a detail panel showing the full `metadata` object (structured JSON), `userAgent`, and archive status.

### Archive Info
If `isArchived === true`, the row shows an archive badge with `archivedAt` timestamp. Archived logs cannot be deleted.

---

## Policy Components — `components/policy/`

### Policy List
Table of all compliance policy documents. Columns: Title, Version, Created By, Last Updated, Actions.

Calls `policyService.getAllPolicies()`.

### Create / Edit Policy Dialog
Rich text or textarea editor for policy `content`. Fields: Title, Content, Version (optional — auto-incremented if blank).

Calls `policyService.createPolicy()` or `policyService.updatePolicy()`.

### Delete Policy
Confirmation dialog before calling `policyService.deletePolicy(id)`.

---

## Blockchain Components — `components/blockchain/`

### Blockchain Ledger Table
Displays all invoices that have been anchored to the blockchain. Columns: Invoice #, Company, Transaction Hash, Anchored At, Status.

Calls `blockchainService.getLedger()` via hook.

**Transaction Hash** is rendered as a truncated, copyable value with a link to the block explorer.

### MetaMask Connection Panel
Allows privileged users to connect their MetaMask wallet for on-chain verification actions.

```ts
const { isConnected, account, connect } = useMetaMaskContext()
```

Displays:
- Connection status badge
- Truncated wallet address when connected
- "Connect Wallet" button when disconnected

### Verification Status Badge
Inline badge shown on invoice detail pages indicating blockchain anchor status:
- `anchored` → green checkmark + transaction hash
- `pending` → yellow clock
- Not anchored → grey dash
