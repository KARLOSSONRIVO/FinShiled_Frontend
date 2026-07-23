# Auth & Session Services

Handles all authentication, MFA, password management, and active session control.

---

## `AuthService` — `services/auth.service.ts`

### Local Types

```ts
interface LoginRequest  { email: string; password: string }

interface LoginResponse {
  success: boolean
  data: { accessToken: string; refreshToken: string; user: { id, email, role, username, status, mfaEnabled } }
}
```

### Methods

#### `login(credentials)`
```ts
AuthService.login(credentials: LoginRequest): Promise<LoginResponse>
```
`POST /auth/login` — Authenticates a user with email + password.

Returns either a full `LoginResponse` (tokens + user), or a partial MFA-challenge response with `{ mfaRequired: true, tempToken: string }` when MFA is enabled. The `AuthProvider` handles both branches.

---

#### `refreshToken(refreshToken)`
```ts
AuthService.refreshToken(refreshToken: string): Promise<RefreshResponse>
```
`POST /auth/refresh` — Exchanges an expiring refresh token for a new access + refresh token pair.

> [!NOTE]
> This is **not called manually** in the app. The `apiClient` response interceptor handles silent token refresh automatically on any `401` response.

---

#### `logout()`
```ts
AuthService.logout(): Promise<void>
```
`POST /auth/logout` — Invalidates the current refresh token on the server.

Reads `refreshToken` from `localStorage` and sends it in the request body. If no refresh token is found, the call is skipped (graceful degradation). The `AuthProvider.logout()` clears local storage and cookies regardless.

---

#### `getMe()`
```ts
AuthService.getMe(): Promise<any>
```
`GET /auth/me` — Returns the authenticated user's profile. Used on app startup by `AuthProvider` to validate a stored token and rehydrate session state.

---

#### `changePassword(payload)`
```ts
AuthService.changePassword({ currentPassword, newPassword }): Promise<any>
```
`POST /auth/change-password` — Changes the authenticated user's password. Triggered by the forced password change dialog when `user.mustChangePassword === true`.

---

#### `verifyMfa(payload)`
```ts
AuthService.verifyMfa({ tempToken, token }): Promise<any>
```
`POST /auth/login/mfa` — Submits a TOTP code to complete MFA login. Requires a `tempToken` issued during the initial `login()` call.

---

#### `setupMfa()`
```ts
AuthService.setupMfa(): Promise<any>
```
`POST /auth/mfa/setup` — Initiates MFA setup, returning a QR code URI and backup codes.

---

#### `enableMfa(payload)`
```ts
AuthService.enableMfa({ token }): Promise<any>
```
`POST /auth/mfa/enable` — Confirms MFA setup by verifying the first TOTP code from the authenticator app.

---

#### `disableMfa(payload)`
```ts
AuthService.disableMfa({ password }): Promise<any>
```
`POST /auth/mfa/disable` — Disables MFA after verifying the user's current password.

---

## `sessionService` — `services/session.service.ts`

Manages the user's active login sessions (devices/browsers).

### Types

```ts
interface SessionItem {
  id: string
  userId: string
  userAgent: string
  createdAt: string
  expiresAt: string
}
```

### Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `listActiveSessions()` | `GET /session` | Returns all active sessions for the current user |
| `getSessionCount()` | `GET /session/count` | Returns `{ count: number }` of active sessions |
| `revokeSession(sessionId)` | `DELETE /session/:id` | Revokes one specific session |
| `revokeAllSessions()` | `DELETE /session/all` | Signs out all other devices |
