# Core & Layout Components

**Directory:** `components/layout/` · `components/global/` · `components/skeletons/`

Infrastructure-level components shared across all roles and pages.

---

## Layout Components — `components/layout/`

### `TopBar`
The persistent top navigation bar rendered on all authenticated pages.

**Contains:**
- App logo / brand
- Current page title or breadcrumb
- User avatar + dropdown menu (profile, settings, logout)
- Notification bell (wired to Socket.IO events)
- Theme toggle shortcut

**Props:** Receives `user` from `useAuthContext()` — no props needed in most usage, hook is called internally.

---

### Sidebar (if present)
Role-aware navigation sidebar. Menu items are conditionally rendered based on `user.role`.

**Role → Nav Items mapping:**
| Role | Key Nav Items |
|------|--------------|
| `SUPER_ADMIN` | Dashboard, Users, Organizations, Assignments, Audit Logs, Blockchain, Policy, Terms |
| `ADMINISTRATOR` | Dashboard, Users, Organizations, Assignments |
| `AUDITOR` | Dashboard, Invoices, Assignments |
| `REGULATOR` | Dashboard, Invoices, Blockchain |
| `COMPANY_MANAGER` | Dashboard, Invoices, Employees |
| `COMPANY_USER` | Dashboard, My Invoices |

---

## Global Components — `components/global/`

### Forced Password Change Dialog
A full-screen modal that appears immediately after login when `user.mustChangePassword === true`. The user cannot close it or navigate away — they must set a new password to proceed.

Calls `AuthService.changePassword({ currentPassword, newPassword })` on submit.

---

## Skeleton Components — `components/skeletons/`

Loading state placeholders that match the shape of real content. Used by all data-dependent components during `isLoading` state from hooks.

**Design rule:** Skeletons use the ShadCN `<Skeleton>` component with `animate-pulse`. They must closely match the dimensions and layout of the real component they're replacing to prevent layout shift.

```tsx
// Pattern used by AppearanceSettings and similar components
if (!mounted) {
  return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
      <CardContent><Skeleton className="h-10 w-full" /></CardContent>
    </Card>
  )
}
```

---

## Global Components — `components/global/`

Invisible components mounted once in `app/layout.tsx` inside `<SocketProvider>`. They render no UI of their own (or minimal fixed-position UI) but handle cross-cutting app behaviour.

---

### `GlobalSocketListeners`

**Renders:** `null` — no visible output.

The central Socket.IO event hub. All real-time events for the entire app are handled here instead of being scattered across individual page components.

**Responsibilities per event:**

| Event | Handler |
|-------|---------|
| `INVOICE_FLAGGED` | Toast: "Invoice Flagged" with `aiRiskScore` and `riskLevel` |
| `INVOICE_CREATED` | Toast: "New Invoice Uploaded" |
| `INVOICE_PROCESSING` | Invalidate `['invoices']` query |
| `INVOICE_AI_COMPLETE` | Invalidate `['invoices']` query |
| `INVOICE_ANCHOR_SUCCESS` | Toast: "Blockchain Anchored" + invalidate `['invoices']` |
| `INVOICE_ANCHOR_FAILED` | Toast (destructive) with error message |
| `INVOICE_LIST_INVALIDATE` | Invalidate `['invoices']` query |
| `ASSIGNMENT_CREATED` | Toast: "New Assignment" + invalidate `['assignments']` |
| `ASSIGNMENT_UPDATED` | Toast: "Assignment Updated" + invalidate `['assignments']` |
| `ASSIGNMENT_DEACTIVATED` | Toast: "Assignment Deactivated" + invalidate `['assignments']` |
| `USER_LIST_INVALIDATE` | Invalidate `['users']`, `['employees']`, `['manager-employees']` |
| `ORG_LIST_INVALIDATE` | Invalidate `['organizations']` |
| `AUDIT_CREATED` | Invalidate `['audit-logs']` + toast for `ORG_CREATED` / `ACCOUNT_LOCKED` actions |

**Implementation note:** All handlers are defined unconditionally before any `useSocketEvent` calls to comply with the Rules of Hooks. The `useSocketEvent` hook handles a `null` socket context internally, so no conditional rendering is needed.

---

### `GlobalPasswordChange`

**Renders:** `null` or `<MustChangePasswordDialog />`.

Guards the entire app with a forced password-change modal. Checks two conditions on every route:
1. Current path is not `/login` or `/forgot-password`
2. `user.mustChangePassword === true`

When both are true, renders `<MustChangePasswordDialog />` — a full-screen modal that cannot be dismissed. The user must set a new password before they can access anything else.

---

### `OfflineBanner`

**Renders:** Animated fixed-position banner at the top-center of the screen.

Listens to `window` `online` / `offline` events to detect network connectivity changes.

**States:**
- **Offline** → red banner with `WifiOff` icon: *"Offline Mode — Viewing cached read-only data. Changes will sync when online."* (stays visible until reconnected)
- **Reconnected** → green banner with `Wifi` icon: *"Reconnected — Refreshing dashboard data..."* (auto-dismisses after 4 seconds, or manually closeable with ✕)

Animated with Framer Motion (`AnimatePresence` + slide-down enter / slide-up exit). Z-index `9999` ensures it appears above all other UI.
