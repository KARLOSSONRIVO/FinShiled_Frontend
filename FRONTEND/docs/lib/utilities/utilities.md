# Utility Helpers

**Files:** `lib/utils.ts` · `lib/styling.ts` · `lib/socket-events.ts`

> Chart utilities (`lib/chart-utils.ts`) and report export (`lib/report-export.ts`) are larger files documented below by function group.

---

## `lib/utils.ts`

### `cn(...inputs)`
```ts
import { cn } from '@/lib/utils'

cn('px-4 py-2', isActive && 'bg-blue-500', className)
```
Merges Tailwind class strings intelligently. Combines `clsx` (handles conditionals/arrays) with `tailwind-merge` (resolves conflicting utilities like `p-4` vs `px-2`).

---

### `sanitizeInput(input)`
```ts
sanitizeInput(input: string): string
```
Basic client-side XSS prevention. Strips:
- `<script>` tags
- `javascript:` protocol strings
- Inline event handlers (`onClick=`, `onLoad=`, etc.)

Use on any user-submitted text before rendering as HTML or passing to an API.

---

## `lib/styling.ts`

Shared CSS class maps for invoice status and AI verdict badges. Used by list/table components to ensure consistent badge colors.

### `VERDICT_STYLES`
```ts
const VERDICT_STYLES = {
  clean:   'bg-emerald-600 text-white',
  flagged: 'bg-red-600 text-white',
  default: 'bg-gray-500 text-white',
}
```

### `STATUS_STYLES`
```ts
const STATUS_STYLES = {
  clean:   'bg-emerald-600 text-white',
  pending: 'bg-slate-500 text-white',
  flagged: 'bg-red-600 text-white',
  default: 'bg-gray-500 text-white',
}
```

### `getVerdictClassName(verdict)`
```ts
getVerdictClassName('clean')    // → 'bg-emerald-600 text-white'
getVerdictClassName('flagged')  // → 'bg-red-600 text-white'
getVerdictClassName('')         // → 'bg-gray-500 text-white' (default)
```

### `getStatusClassName(status)`
```ts
getStatusClassName('pending')  // → 'bg-slate-500 text-white'
getStatusClassName('fraud')    // → 'bg-red-600 text-white'  (aliased to flagged)
getStatusClassName('unknown')  // → 'bg-gray-500 text-white' (default)
```

---

## `lib/socket-events.ts`

Constants for all Socket.IO event names. Always use `SocketEvents.*` instead of raw strings to avoid typos and benefit from TypeScript autocomplete.

```ts
import { SocketEvents } from '@/lib/socket-events'

socket.on(SocketEvents.INVOICE_FLAGGED, handler)
```

### Event Reference

| Constant | Event string | Trigger |
|----------|-------------|---------|
| `INVOICE_CREATED` | `invoice:created` | Invoice uploaded and saved |
| `INVOICE_PROCESSING` | `invoice:processing` | AI analysis started |
| `INVOICE_AI_COMPLETE` | `invoice:ai:complete` | AI analysis finished |
| `INVOICE_FLAGGED` | `invoice:flagged` | AI marked invoice as flagged |
| `INVOICE_ANCHOR_SUCCESS` | `invoice:anchor:success` | Blockchain anchor successful |
| `INVOICE_ANCHOR_FAILED` | `invoice:anchor:failed` | Blockchain anchor failed |
| `INVOICE_LIST_INVALIDATE` | `invoice:list:invalidate` | Invoice list should be refetched |
| `ASSIGNMENT_CREATED` | `assignment:created` | New auditor assignment created |
| `ASSIGNMENT_UPDATED` | `assignment:updated` | Assignment status changed |
| `ASSIGNMENT_DEACTIVATED` | `assignment:deactivated` | Assignment deactivated |
| `USER_LIST_INVALIDATE` | `user:list:invalidate` | User list should be refetched |
| `ORG_LIST_INVALIDATE` | `org:list:invalidate` | Org list should be refetched |
| `AUDIT_CREATED` | `audit:created` | New audit log entry created |

```ts
// Type for all possible event strings
type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents]
```
