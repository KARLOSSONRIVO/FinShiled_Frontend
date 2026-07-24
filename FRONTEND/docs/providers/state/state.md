# State Providers

Core application state: user session and server-state caching.

---

## `AuthProvider` — `providers/auth-provider.tsx`

The central auth context. Wraps the entire app and exposes user session state + auth actions to all children via `useAuthContext()`.

### Context Interface

```ts
interface AuthContextType {
  user: User | null          // null = not authenticated
  isAuthenticated: boolean   // shorthand for !!user
  isLoading: boolean         // true during startup validation or login
  login(credentials): Promise<any>
  logout(): Promise<void>
  refreshUser(): Promise<void>
  clearSession(): void
  completeMfaAuthentication(response): void
}
```

### How to Use

```ts
import { useAuthContext } from '@/providers/auth-provider'

const { user, isAuthenticated, login, logout } = useAuthContext()
```

Throws if called outside `<AuthProvider>`.

---

### Startup Sequence

On mount, `AuthProvider` runs `initializeAuth()`:

1. Reads `token` from `localStorage`
2. If none → sets `isLoading = false`, done (unauthenticated)
3. If found → calls `AuthService.getMe()` with a **5-second timeout**
   - Success → stores user in state + `localStorage`
   - Failure (expired token, network error, timeout) → clears all session data silently

The 5s timeout prevents `isLoading` from hanging indefinitely when the backend is unreachable.

---

### `login(credentials)`

1. Calls `AuthService.login()`
2. Stores the restricted response in session storage and routes to password change or `/mfa`
3. Only `completeMfaAuthentication()` calls `handleAuthSuccess()`, after successful MFA, which:
   - Stores `accessToken`, `refreshToken`, `user` in `localStorage`
   - Sets `token` cookie for the Next.js middleware (1 day, SameSite=Strict)
   - Calls `navigateBasedOnRole(user)` to redirect

---

### `logout()`

1. Calls `AuthService.logout()` (ignores errors — token may already be invalid)
2. Removes `token`, `refreshToken`, `user` from `localStorage`
3. Removes all keys prefixed with `finshield_` or `FINSHIELD_` from `localStorage` (clears cached layout prefs and query data)
4. Expires the `token` cookie
5. Redirects to `/login`

---

### Role-Based Navigation — `navigateBasedOnRole(user)`

| Role | Redirect |
|------|---------|
| `SUPER_ADMIN` | `/admin/superadmin` |
| `ADMINISTRATOR` / `ADMIN` | `/admin/admin` |
| `AUDITOR` | `/admin/external-auditor` |
| `REGULATOR` | `/admin/regulator` |
| `COMPANY_MANAGER` | `/company/manager` |
| `COMPANY_USER` | `/company/employee` |
| _(other)_ | `/` |

If `user.mustChangePassword === true`, navigation is skipped — the global forced-change-password dialog appears instead.

---

## `QueryProvider` — `providers/QueryProvider.tsx`

Configures TanStack Query (React Query) with persistence to `localStorage`.

### Query Client Settings

```ts
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,       // 5 minutes — data considered fresh
    gcTime:    24 * 60 * 60 * 1000, // 24 hours — cache kept in memory
  }
}
```

### Persistence

Uses `@tanstack/query-sync-storage-persister` to save the query cache to `localStorage` under the key `FINSHIELD_QUERY_CACHE`.

**Only these query keys are persisted** (security: avoid caching sensitive data):
```ts
'terms' | 'sidebar-prefs' | 'user-theme'
```

All other queries (invoices, users, orgs, etc.) are **not** persisted — they are always re-fetched fresh.

### SSR Handling

The persister is created inside a `useEffect` (client-side only). Until it's ready, a non-persistent `QueryClientProvider` is used as a fallback so the app renders immediately without hydration errors.
