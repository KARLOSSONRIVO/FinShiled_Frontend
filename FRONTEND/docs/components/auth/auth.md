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

## Change Temporary Password Page — `app/change-temporary-password/page.tsx`

The dedicated full-page screen rendered when `user.mustChangePassword === true`. Users cannot access any other part of the app until this step is complete (enforced by `PasswordChangeGate`).

**Fields:** Current temporary password · New password · Confirm new password

**Validation (client-side, real-time):**
- At least 12 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character
- New password ≠ current temporary password
- New password matches confirmation

**Submission:** calls `AuthService.changePassword({ currentPassword, newPassword, confirmPassword })` → on success, calls `clearSession()` and redirects to `/login`.

### Responsive Layout

The page uses **two separate layouts** via Tailwind breakpoints — same state and logic, different visual presentation:

| | Mobile (`< lg`) | Desktop (`lg+`) |
|---|---|---|
| **Logo** | Large centered logo (`h-28`), matches login page | Inside dark left panel |
| **Heading** | `"Change your password"` bold `text-3xl` + subtitle | `"Change temporary password"` inside white card |
| **Form wrapper** | No card — bare form on `bg-[#f5f5f0]` background | White `rounded-[28px]` card with shadow |
| **Input height** | `h-14` rounded-xl white inputs (matches login) | `h-12` inputs |
| **Submit button** | `h-14 bg-emerald-500 rounded-xl shadow-lg` (matches login) | `h-12 bg-emerald-600` |
| **Requirements box** | White card with border | Green-tinted `bg-[#f3f7f5]` card |
| **Left panel** | Hidden | Dark `bg-[#101714]` panel with steps timeline |

The mobile layout intentionally mirrors the `/login` page to provide a consistent auth experience on small screens. The desktop layout keeps the original two-column design with the dark informational panel on the left.

> [!NOTE]
> Both the desktop form and the mobile form share the same React state (`showCurrent`, `showNew`, `showConfirm`, `currentPassword`, etc.). They use distinct `id` attributes (e.g. `current-password` vs `current-password-m`) to avoid duplicate-id issues in the DOM.

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
