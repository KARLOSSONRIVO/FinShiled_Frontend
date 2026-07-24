# Frontend Route Protection

**File:** `proxy.ts`

The Next.js proxy checks for the complete-session `token` cookie before protected pages render. Public paths are `/`, `/login`, `/forgot-password`, `/change-temporary-password`, and `/mfa`. The last two must stay public because restricted temporary authentication deliberately does not create the cookie.

Static assets, Next internals, and local API paths are excluded by the matcher. A protected path without the cookie redirects to `/login`.

This layer is only a fast navigation gate. `AuthProvider` validates the token through `GET /auth/me`, while the backend enforces signature/expiry, authenticated scope, successful MFA claims, current `authVersion`, account status, RBAC, and activated permanent email MFA.

Temporary tokens are stored in session storage and sent only as `X-Temporary-Auth`; the proxy never treats them as authenticated sessions.
