# Auth Components

**Directory:** `components/auth/`

Components used exclusively in the authentication and account-security flows.

---

## Login Form
The primary sign-in screen at `/login`.

**Fields:** Email, Password

**Flow:**
1. Submit → calls `AuthService.login()` via `useAuthContext().login()`
2. On `mfaRequired: true` response → renders `MfaInput` inline (no page redirect)
3. On success → `AuthProvider` handles role-based redirect automatically

Validation is done with `react-hook-form` + `zod`. Errors are shown inline below each field. Backend errors are displayed as a `sonner` toast.

---

## MFA Input
TOTP code entry rendered after a successful password login when MFA is enabled.

Uses `input-otp` for the 6-digit code input with auto-advance between digits.

On submit → calls `useAuthContext().verifyMfaLogin(tempToken, token)`.

The `tempToken` is passed down from the login form state (returned by the initial `login()` call).

---

## Forgot Password Flow
Located at `/forgot-password`. Multi-step form:

1. **Step 1** — Email input → triggers password reset email
2. **Step 2** — Reset token + new password entry

---

## Change Password Dialog — `components/auth/` or `components/global/`
Appears in two contexts:

1. **Forced change** — when `user.mustChangePassword === true`, the user is redirected to `/change-temporary-password` (a dedicated page). They cannot access any other part of the app until the password is changed. Calls `AuthService.changePassword()`.
2. **Voluntary change** — accessible from Settings → Security. Same form, same service call.

---

## MFA Settings (in `components/settings/`)
Enable/disable MFA from the Security settings panel.

**Enable flow:**
1. Call `AuthService.setupMfa()` → returns a QR code URI
2. Display QR code for user to scan in authenticator app
3. User enters the first 6-digit code → call `AuthService.enableMfa({ token })`
4. `AuthProvider.enableMfa()` updates `user.mfaEnabled = true` in state + localStorage

**Disable flow:**
1. User enters their current password
2. Call `AuthService.disableMfa({ password })`
3. `AuthProvider.disableMfa()` updates `user.mfaEnabled = false` in state + localStorage

---

## PasswordChangeGate — `components/auth/PasswordChangeGate.tsx`

A lightweight client component that **wraps the entire app** (mounted in `app/layout.tsx`). It guards against a user with `mustChangePassword === true` from accessing any protected page.

**Behaviour:**
- If `user.mustChangePassword` is `true` and the user is **not** on `/change-temporary-password` → renders `null` and fires `router.replace('/change-temporary-password')`.
- In all other cases → renders children normally with zero interruption.

> [!IMPORTANT]
> The gate does **not** block rendering during auth initialization (`isLoading`). Blocking on `isLoading` caused a visible loading flash for every user on every page refresh. The redirect logic in the `useEffect` already waits for `isLoading` to be `false` before firing, so correctness is preserved.

**Props:** none — reads `user` and `isLoading` from `useAuthContext()` internally.
