# Authentication Flow

**Key files:** `providers/auth-provider.tsx` · `services/auth.service.ts` · `lib/api-client.ts` · `middleware.ts`

---

## Full Login Flow

```
User submits email + password
        ↓
AuthService.login(credentials)
  POST /auth/login
        ↓
┌─────────────────────────────────────────┐
│ Response: mfaRequired = true?           │
│  YES → return { mfaRequired, tempToken }│
│         UI shows MFA input              │
│         ↓                              │
│  User submits 6-digit TOTP code        │
│  AuthService.verifyMfa({ tempToken, token })│
│         POST /auth/login/mfa           │
└─────────────────────────────────────────┘
        ↓
handleAuthSuccess(response)
  ├── Store accessToken  → localStorage['token']
  ├── Store refreshToken → localStorage['refreshToken']
  ├── Store user         → localStorage['user']
  ├── Set cookie         → token=<accessToken>; path=/; max-age=86400; SameSite=Strict
  └── setUser(userData)  → React state
        ↓
navigateBasedOnRole(user)
  → redirect to role dashboard
```

---

## Temporary Password Change Flow

Triggered when a newly created user logs in with an admin-assigned temporary password.

```
Login succeeds
        ↓
handleAuthSuccess() → setUser(userData)
        ↓
navigateBasedOnRole() checks user.mustChangePassword
  true  → router.replace('/change-temporary-password')
  false → normal role-based redirect
        ↓
PasswordChangeGate (in layout.tsx) detects mustChangePassword = true
  → renders null, fires router.replace('/change-temporary-password')
  → user cannot navigate away until password is changed
        ↓
User submits new password on /change-temporary-password
  → AuthService.changePassword()
  → mustChangePassword = false on backend
  → refreshUser() updates local state
  → redirect to role dashboard
```

> [!NOTE]
> `PasswordChangeGate` uses `return null` (not a loading screen) while the redirect is in flight. It does **not** block on `isLoading` — doing so caused an unwanted loading flash for all users on every page refresh.

---

## Startup / Session Restore Flow


Runs once on app mount inside `AuthProvider`:

```
App loads
  ↓
Read localStorage['token']
  ↓ (not found)
setIsLoading(false) → unauthenticated state

  ↓ (found)
Race: AuthService.getMe() vs 5-second timeout
  ↓ (success)
setUser(userData) → authenticated state

  ↓ (failure — expired, network error, or timeout)
Clear: localStorage['token', 'refreshToken', 'user']
Clear: document.cookie token
setIsLoading(false) → unauthenticated state
```

The **5-second timeout** is critical — without it, a slow or offline backend would keep the app stuck on a loading screen indefinitely.

---

## Silent Token Refresh Flow

Handled entirely by the `apiClient` response interceptor in `lib/api-client.ts`. Components and hooks never see this happen.

```
Any API response → 401 Unauthorized
        ↓
Is the endpoint /auth/login, /auth/refresh, or /auth/logout?
  YES → skip refresh, reject immediately (avoid infinite loop)
        ↓
Is a refresh already in progress?
  YES → queue this request, wait for completion
        ↓
  NO → start refresh

Read localStorage['refreshToken']
  ↓ (not found)
Clear session → redirect to /login

  ↓ (found)
POST /auth/refresh { refreshToken }
  ↓ (success)
Store new tokens → localStorage
Update apiClient default Authorization header
Flush queued requests with new token
Retry original failed request

  ↓ (failure)
Flush queued requests with error
Clear session (localStorage + cookie)
Redirect to /login (if not already there)
```

---

## Logout Flow

```
AuthProvider.logout()
  ↓
AuthService.logout()  ← POST /auth/logout (errors silently ignored)
  ↓
Remove from localStorage:
  - token, refreshToken, user
  - all keys starting with finshield_ or FINSHIELD_
  (clears sidebar prefs, query cache keys, layout settings)
  ↓
Expire cookie: token=; expires=Thu, 01 Jan 1970...
  ↓
setUser(null)
router.push('/login')
```

---

## MFA Setup Flow

```
User clicks "Enable MFA" in Security Settings
  ↓
AuthService.setupMfa()  ← POST /auth/mfa/setup
  → returns { qrCodeUri, backupCodes }
  ↓
Display QR code (user scans with Google Authenticator / Authy)
  ↓
User enters first TOTP code to confirm
AuthService.enableMfa({ token })  ← POST /auth/mfa/enable
  ↓
AuthProvider updates user.mfaEnabled = true in state + localStorage
```

---

## Route Protection

Two layers of protection work together:

| Layer | Where | What it checks |
|-------|-------|----------------|
| **Middleware** (`proxy.ts`) | Next.js Edge | Presence of `token` cookie |
| **AuthProvider** (`providers/auth-provider.tsx`) | Client (React) | Valid session via `GET /auth/me` |
| **PasswordChangeGate** (`components/auth/PasswordChangeGate.tsx`) | Client (React) | `user.mustChangePassword` flag |

The middleware is a fast first gate — it redirects unauthenticated users before the page even loads. The `AuthProvider` is the source of truth for the actual user object and role.

> [!NOTE]
> Role-based access (which role can access which URL) is **not** enforced in middleware. It is enforced purely by `navigateBasedOnRole()` on login, and by the component rendering logic on each page. If a user manually navigates to a URL for a different role, they will see an empty page or be redirected by the page's own role guard.

---

## Token Storage Strategy

| Item | Storage | Why |
|------|---------|-----|
| `accessToken` | `localStorage` + cookie | localStorage for `apiClient`; cookie for middleware |
| `refreshToken` | `localStorage` | Used by `apiClient` interceptor on 401 |
| `user` | `localStorage` | Instant session restore without a network call on refresh |

The cookie is set with `SameSite=Strict` and `max-age=86400` (24 hours). It is **not** `HttpOnly` because it is written by client-side JavaScript. Its sole purpose is to give the Next.js Edge Middleware something to read.
