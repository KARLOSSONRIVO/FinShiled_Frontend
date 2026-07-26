# Architecture Overview

FinShield is an **AI-powered invoice fraud detection and blockchain verification** platform. This document describes how the frontend layers connect.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js 16)                     │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐  │
│  │  Pages   │   │Components│   │  Hooks   │   │ Providers  │  │
│  │(app dir) │←──│          │←──│(data +   │←──│(Auth,Query,│  │
│  │          │   │(UI only) │   │ state)   │   │ Socket...) │  │
│  └──────────┘   └──────────┘   └──────────┘   └────────────┘  │
│                                      │                          │
│                               ┌──────────┐                     │
│                               │ Services │                      │
│                               │(API calls│                      │
│                               │  only)   │                      │
│                               └────┬─────┘                     │
│                                    │                            │
│                            ┌───────────────┐                    │
│                            │  api-client   │                    │
│                            │  (Axios +     │                    │
│                            │  interceptors)│                    │
│                            └───────┬───────┘                    │
└────────────────────────────────────┼────────────────────────────┘
                                     │ HTTP (REST) + WebSocket
                    ┌────────────────┴─────────────────────┐
                    │           Backend API (NestJS)        │
                    │                                       │
                    │  /auth   /invoice   /user   /audit   │
                    │  /organization   /assignment          │
                    │  /blockchain   /policy   /terms       │
                    └───────────────────────────────────────┘
```

---

## Layer Responsibilities

| Layer | Folder | Rule |
|-------|--------|------|
| **Pages** | `app/` | Route entry points only — no logic, no direct API calls |
| **Components** | `components/` | Rendering only — consume hooks, emit events |
| **Hooks** | `hooks/` | All state management and data transformation |
| **Services** | `services/` | All HTTP calls — one file per API domain |
| **API Client** | `lib/api-client.ts` | Single Axios instance with auth interceptors |
| **Providers** | `providers/` | App-wide context (auth, query cache, socket, theme) |
| **Types** | `lib/types/` | Shared TypeScript interfaces — no logic |

> [!IMPORTANT]
> Components **never** call `apiClient` or services directly. The chain is always:
> `Component → Hook → Service → apiClient → Backend`

---

## User Roles

FinShield has 6 user roles, each with its own dashboard and capabilities:

| Role | Dashboard Route | Key Capabilities |
|------|----------------|-----------------|
| `OWNER` | `/admin/owner` | Full system access: users, orgs, assignments, audit logs, blockchain, policies, terms |
| `ADMINISTRATOR` | `/admin/admin` | Users, organizations, assignments |
| `AUDITOR` | `/admin/external-auditor` | Review invoices for assigned companies |
| `REGULATOR` | `/admin/regulator` | Read-only view of all invoices + blockchain transactions |
| `COMPANY_MANAGER` | `/company/manager` | Manage company invoices and employees |
| `COMPANY_USER` | `/company/employee` | Upload and view own invoices |

Role routing is handled in `navigateBasedOnRole()` inside `AuthProvider` — see [auth flow docs](./auth-flow.md).

---

## Invoice Lifecycle

```
COMPANY_USER or COMPANY_MANAGER uploads invoice (PDF/image)
        ↓
Backend: save to storage → INVOICE_CREATED socket event
        ↓
Backend: AI analysis begins → INVOICE_PROCESSING socket event
        ↓
AI verdict: "clean" or "flagged"
  → INVOICE_AI_COMPLETE socket event (triggers query invalidation)
  → INVOICE_FLAGGED socket event if flagged (triggers toast notification)
        ↓
AUDITOR reviews invoice (for assigned companies)
  → submitReview({ reviewDecision: 'approved' | 'rejected', reviewNotes })
        ↓
Backend: anchor to blockchain (if approved)
  → INVOICE_ANCHOR_SUCCESS or INVOICE_ANCHOR_FAILED socket event
        ↓
Invoice status: "anchored" — visible on blockchain transactions
```

---

## Real-Time Event System

Socket.IO events flow from the backend to all connected clients. The `GlobalSocketListeners` component (rendered once in `app/layout.tsx`) handles all events globally:

| Event | Action |
|-------|--------|
| `INVOICE_FLAGGED` | Toast: "Invoice Flagged" with risk score |
| `INVOICE_AI_COMPLETE` | Invalidate `['invoices']` query |
| `INVOICE_ANCHOR_SUCCESS` | Toast + invalidate `['invoices']` |
| `INVOICE_ANCHOR_FAILED` | Toast (destructive) with error |
| `INVOICE_CREATED` | Toast: "New Invoice Uploaded" |
| `INVOICE_PROCESSING` | Invalidate `['invoices']` |
| `ASSIGNMENT_CREATED` | Toast + invalidate `['assignments']` |
| `ASSIGNMENT_UPDATED` | Toast + invalidate `['assignments']` |
| `USER_LIST_INVALIDATE` | Invalidate `['users', 'employees', 'manager-employees']` |
| `ORG_LIST_INVALIDATE` | Invalidate `['organizations']` |
| `AUDIT_CREATED` | Invalidate `['audit-logs']` + toast for critical actions |

---

## Provider Tree (`app/layout.tsx`)

```
<ThemeProvider>               ← dark/light mode (next-themes)
  <QueryProvider>             ← TanStack Query + localStorage persistence
    <AuthProvider>            ← user session, login/logout, MFA
      <SocketProvider>        ← Socket.IO connection (auth-reactive)
        <GlobalSocketListeners />   ← invisible: handles all socket events
        <GlobalPasswordChange />    ← invisible: forced password change gate
        <OfflineBanner />           ← fixed UI: offline/reconnected banner
        {children}
      </SocketProvider>
    </AuthProvider>
  </QueryProvider>
</ThemeProvider>
<Analytics />                 ← Vercel Analytics (outside providers, no auth needed)
<Toaster />                   ← sonner toast container (30s duration, bottom-right)
```

> [!NOTE]
> `MetaMaskProvider` and `SmoothScrolling` are **not** in the root layout — they are likely added in specific sub-layouts (e.g. the blockchain admin layout).

---

## Data Fetching Strategy

| Pattern | When used |
|---------|----------|
| `useQuery` — fetch all, filter client-side | Invoice lists (all role hooks) — allows instant filter/sort without network round-trips |
| `useQuery` — server-paginated | Audit logs, user lists, org lists — large datasets where client-side filtering is impractical |
| `useMutation` | Write operations (review submit, user create, org update, etc.) |
| Query invalidation via socket | After any socket event, affected query keys are invalidated → TanStack Query re-fetches automatically |

**Cache TTL:**
- `staleTime`: 5 minutes (data considered fresh, no background refetch)
- `gcTime`: 24 hours (cache kept in memory before garbage collection)
- Persistent cache: only `terms`, `sidebar-prefs`, `user-theme` are persisted to `localStorage`
