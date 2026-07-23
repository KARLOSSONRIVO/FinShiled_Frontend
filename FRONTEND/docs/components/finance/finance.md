# Finance Components

**Directory:** `components/invoices/` · `components/dashboard/` · `components/reports/` · `components/alerts/`

Components for invoice management, financial dashboards, reports, and alerts.

---

## Invoice Components — `components/invoices/`

### Invoice List / Table
The main invoice data table. Renders rows from the relevant role hook (e.g. `useEmployeeInvoices`, `useManagerInvoices`).

**Columns vary by role:**
- Employee: Invoice #, Date, Amount, Status, AI Verdict
- Manager/Auditor: above + Company, Uploaded By, Review Decision
- Regulator: above + Blockchain anchor status

**Sorting:** Column headers are clickable. Each click cycles: ascending → descending → unsorted. Uses `requestSort()` from the hook.

**Pagination:** Rendered below the table. Connected to `setPage()` from the hook. Shows `totalPages` and current `page`.

---

### Invoice Filter Bar — `components/invoices/PendingInvoiceFilter.tsx`
A filter row that renders above the invoice table.

**Filter controls:**
- Search input (debounced, searches `invoiceNumber` + `companyName`)
- Status dropdown (`all`, `pending`, `clean`, `flagged`, `anchored`, `accepted`, `rejected`)
- AI Verdict dropdown (`all`, `clean`, `flagged`)
- Date range picker (`react-day-picker` calendar)
- Month/Year selects (for coarse time filtering)
- Reset button (visible only when `hasActiveFilters === true`)

> [!NOTE]
> `statusFilter` and `aiVerdictFilter` are **mutually exclusive** — setting one clears the other. This is enforced in the hook, not the component.

---

### Invoice Detail Modal / Page
Full detail view for a single invoice. Loaded via `InvoiceService.getById(id)`.

**Sections:**
1. **Header** — Invoice number, company, date, amount, status badge
2. **AI Analysis** — Verdict badge, risk score, summary
3. **Document Preview** — Image/PDF viewer (uses `imageUrl` from `InvoiceDetail`)
4. **Blockchain** — Transaction hash, anchor timestamp, IPFS CID (if anchored)
5. **Review** — Reviewer name, decision, notes, reviewed-at timestamp (if reviewed)

---

### Review Dialog (Auditor only)
Modal form for submitting or updating an invoice review decision.

```ts
// Calls:
InvoiceService.submitReview(invoiceId, {
  reviewDecision: 'approved' | 'rejected',
  reviewNotes: string,
})
```

When `ReviewResponse.isUpdate === true`, the UI shows "Review updated" instead of "Review submitted".

---

## Dashboard Components — `components/dashboard/`

### Stat Cards
Summary metric cards at the top of each role dashboard. Data comes from `DashboardService.*Stats()`.

Fields displayed vary by role — see `DashboardStats` in [finance services docs](../../services/finance/finance.md).

### `RecentInvoices` — `components/dashboard/RecentInvoices.tsx`
A compact table showing the 5–7 most recently uploaded invoices. Used on manager and employee dashboards.

### Charts
Recharts-based visualisations for invoice volume trends, AI verdict distribution, and monthly revenue. Data is transformed by helpers in `lib/chart-utils.ts`.

---

## Reports Components — `components/reports/`

UI for generating and downloading reports. Triggers export functions from `lib/report-export.ts`.

**Export formats:** XLSX and CSV (using the `xlsx` library).

---

## Alerts Components — `components/alerts/`

Notification UI for flagged invoices and system events. Wired to Socket.IO events via `SocketContext`:

- `INVOICE_FLAGGED` → shows a toast + adds to alert list
- `INVOICE_ANCHOR_SUCCESS` / `INVOICE_ANCHOR_FAILED` → shows a toast notification
