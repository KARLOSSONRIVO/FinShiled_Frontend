# Shared Hooks

Hooks used across multiple roles or not tied to any specific role's data domain.

---

## `useAuthContext` — via `providers/auth-provider.tsx`

The primary hook for accessing the authenticated user and auth actions anywhere in the app.

```ts
import { useAuthContext } from '@/providers/auth-provider'

const {
  user,              // User | null
  isAuthenticated,   // boolean
  isLoading,         // boolean — true during startup or login
  login,
  logout,
  refreshUser,
  clearSession,
  completeMfaAuthentication,
} = useAuthContext()
```

See [state providers docs](../../providers/state/state.md) for full behaviour details.

---

## `useSocket` / `SocketContext` — via `providers/socket-provider.tsx`

Access the global Socket.IO connection.

```ts
import { useContext } from 'react'
import { SocketContext } from '@/providers/socket-provider'
import { SocketEvents } from '@/lib/socket-events'

const { on, off } = useContext(SocketContext)!

useEffect(() => {
  const unsub = on(SocketEvents.INVOICE_FLAGGED, (data) => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] })
  })
  return unsub   // cleans up listener on unmount
}, [on])
```

The `on()` function returns a cleanup function that calls `off()` — always return it from `useEffect`.

---

## Filter Hooks — `hooks/filters/`

Reusable filter state logic extracted so multiple list views can share the same filtering pattern without duplication.

Common filter hooks:
- Date range state (`DateRange` from `react-day-picker`)
- Month/year select state
- Search debounce state
- Sort state (key + direction toggle)

---

## Upload Hooks — `hooks/upload/`

Handles file upload state, progress tracking, and error handling for invoice uploads.

```ts
// Typical shape
const {
  upload,           // (file: File) => Promise<void>
  isUploading,      // boolean
  progress,         // number (0–100)
  error,            // string | null
  reset,            // () => void — clear state after upload
} = useInvoiceUpload()
```

After a successful upload, the hook invalidates the `['invoices']` query key so the list refetches automatically via Socket.IO or on the next focus.

---

## Common / Global Hooks — `hooks/common/` · `hooks/global/`

| Hook | Description |
|------|-------------|
| `use-auth.ts` | Lightweight auth state reader (used by `SocketProvider`) |
| `use-socket.ts` | Raw Socket.IO connection manager (used by `SocketProvider`) |
| `use-metamask.ts` | MetaMask wallet connection + Web3 actions |
