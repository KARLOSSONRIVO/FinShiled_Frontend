# Settings Components

**Directory:** `components/settings/`

User-facing preference panels accessible from the Settings page.

---

## `AppearanceSettings` — `components/settings/AppearanceSettings.tsx`

Dark/light theme toggle.

```tsx
<Moon /> ──── [Switch] ──── <Sun />
```

**Implementation details:**
- Uses `useTheme()` from `next-themes`
- Renders a skeleton during SSR / before mount to prevent hydration mismatch (the `mounted` state guard)
- Switch `checked={!isDark}` — checked state = light mode (right/sun side)
- `onCheckedChange` maps: `checked=true` → `'light'`, `checked=false` → `'dark'`
- Switch turns emerald when in light mode (`data-[state=checked]:bg-emerald-600`)

**Gotcha:** The `mounted` guard is critical. Without it, `useTheme()` returns `undefined` on the server, causing a hydration mismatch between SSR and client render.

---

## Profile Settings
Edit display name, email, and profile picture.

Calls the relevant update endpoint (via `UserService` or a dedicated profile endpoint).

---

## Security Settings
Contains:
- **Change Password** — form calling `AuthService.changePassword()`
- **MFA Enable/Disable** — toggle described in [auth components docs](../auth/auth.md)
- **Active Sessions** — table of sessions from `sessionService.listActiveSessions()`, with "Revoke" buttons calling `sessionService.revokeSession(id)` and a "Sign out all devices" button calling `sessionService.revokeAllSessions()`

---

## Terms Settings — `components/terms/`

Displays the current Terms & Conditions document. Users must accept the latest version before using the system.

Calls `termsService.getAllTerms()` to fetch the active version.

Acceptance is recorded server-side on submit.
