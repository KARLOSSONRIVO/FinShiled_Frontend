# Authentication Flow

**Key files:** `providers/auth-provider.tsx`, `services/auth.service.ts`, `lib/api-client.ts`, `proxy.ts`, `app/mfa/page.tsx`, `app/change-temporary-password/page.tsx`

FinShield never creates a working session after password verification alone. Every account has permanent email MFA; a verified authenticator can be added as an optional second choice.

## Login state machine

```text
email + password
  -> PASSWORD_CHANGE_REQUIRED
       -> change temporary password
       -> LOGIN_REQUIRED
  -> MFA_CHALLENGE_REQUIRED
       -> select email or enrolled authenticator
       -> verify code
       -> AUTHENTICATED
```

`POST /auth/login` returns a short-lived `tempToken`, never normal tokens. The provider stores this temporary response in `sessionStorage['finshield_temp_auth']` and routes to `/change-temporary-password` or `/mfa`. Temporary calls use the `X-Temporary-Auth` header and are excluded from the refresh interceptor.

Only `completeMfaAuthentication()` persists `accessToken`, `refreshToken`, and the safe user object, sets the route-guard cookie, and redirects to the dashboard for the user's role.

## First login

1. The user signs in with emailed temporary credentials.
2. `/change-temporary-password` uses the temporary token to replace the password, marks registered email MFA active, invalidates the temporary session, and returns the user to login. A normal session still does not exist.
3. The next login opens `/mfa` with method selection, masked-email code entry, resend countdown, loading/error states, and cancel-session control.
4. A successful email or enrolled-authenticator challenge creates the full session.

## Method selection

The preferred method is the primary action. Email is primary by default. When a verified authenticator is preferred, it becomes primary and email appears under **More options**. The authenticator choice is never rendered until enrollment was successfully verified.

## Security settings

Email is shown as permanently enabled and cannot be removed. Add, replace, remove, and preferred-method changes require a password and emailed-code step-up. Authenticator setup shows a QR image and manual key, then requires a valid current TOTP before activation. Removing/replacing an authenticator clears the browser session when the backend invalidates active sessions.

## Session restore and refresh

On startup, the provider validates a stored access token with `GET /auth/me`, bounded by a five-second client timeout. Failed validation clears local storage and the cookie. The API client rotates tokens after eligible `401` responses; login, refresh, logout, temporary-password, and MFA endpoints are never recursively refreshed.

## Route protection

`proxy.ts` treats `/login`, `/forgot-password`, `/change-temporary-password`, `/mfa`, and `/` as public because the first-login/MFA pages deliberately have no complete-session cookie. All dashboard pages require the cookie as a fast frontend gate. The backend is authoritative: it rejects temporary scope, tokens without `mfaVerified`, stale `authVersion`, and inconsistent accounts whose permanent email MFA is inactive.

See [mandatory-mfa.md](./mandatory-mfa.md) for the screen, service, settings, administrator reset, and testing contract.
