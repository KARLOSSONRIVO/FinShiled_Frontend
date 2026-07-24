# Remove Settings Email Verification Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the standalone Email Verification status card from every Settings page that uses the shared `SettingsPage` component.

**Architecture:** Make one presentation-only change in the shared Settings component so all consuming role routes inherit it. Add a focused component regression test that isolates `SettingsPage` from MFA and dialog internals while verifying that the removed card is absent and neighboring controls remain.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library

## Global Constraints

- Preserve the profile information, MFA settings, password management, and appearance settings.
- Preserve the `emailVerified` user data fields and all email-based MFA behavior.
- Do not modify unrelated existing working-tree changes.

---

### Task 1: Remove the standalone Settings email-verification card

**Files:**
- Create: `components/settings/SettingsPage.test.tsx`
- Modify: `components/settings/SettingsPage.tsx`

**Interfaces:**
- Consumes: `SettingsPage(): JSX.Element` and the existing `useAuth()` hook result.
- Produces: The same `SettingsPage` component API, without the standalone `Email Verification` heading/card.

- [x] **Step 1: Write the failing component test**

Create `components/settings/SettingsPage.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

const auth = vi.hoisted(() => ({
    user: {
        username: "finshield-user",
        email: "user@example.com",
        role: "company_employee",
        emailVerified: true,
    },
}))

vi.mock("@/hooks/global/use-auth", () => ({
    useAuth: () => auth,
}))

vi.mock("./MFASettings", () => ({
    MFASettings: () => (
        <section aria-label="Multi-factor authentication">
            Multi-factor authentication settings
        </section>
    ),
}))

vi.mock("./AppearanceSettings", () => ({
    AppearanceSettings: () => <section>Appearance settings</section>,
}))

vi.mock("./ChangePasswordDialog", () => ({
    ChangePasswordDialog: () => null,
}))

vi.mock("framer-motion", () => ({
    motion: {
        div: ({
            children,
            initial: _initial,
            animate: _animate,
            transition: _transition,
            layoutId: _layoutId,
            ...props
        }: React.ComponentProps<"div"> & {
            initial?: unknown
            animate?: unknown
            transition?: unknown
            layoutId?: string
        }) => <div {...props}>{children}</div>,
    },
}))

import { SettingsPage } from "./SettingsPage"

describe("SettingsPage", () => {
    it("omits the standalone email-verification card and keeps surrounding account controls", () => {
        render(<SettingsPage />)

        expect(screen.getByRole("heading", { name: "Profile Information" })).toBeVisible()
        expect(screen.queryByRole("heading", { name: "Email Verification" })).not.toBeInTheDocument()
        expect(screen.getByLabelText("Multi-factor authentication")).toBeVisible()
        expect(screen.getByRole("heading", { name: "Password Management" })).toBeVisible()
    })
})
```

- [x] **Step 2: Run the focused test and confirm the expected failure**

Run:

```powershell
npm test -- components/settings/SettingsPage.test.tsx
```

Expected: one failed test because the existing `Email Verification` heading is still present.

- [x] **Step 3: Remove the card and unused icon imports**

In `components/settings/SettingsPage.tsx`, change the Lucide import to:

```tsx
import { User, Shield, Lock, KeyRound } from "lucide-react"
```

Delete the complete standalone block between the Profile Information card and `MFASettings`, leaving this adjacency:

```tsx
                        </div>

                        {/* Authentication Card (MFA) */}
                        <MFASettings />
```

Do not remove `user.emailVerified` from shared types/providers and do not change `MFASettings`.

- [x] **Step 4: Run the focused test and confirm it passes**

Run:

```powershell
npm test -- components/settings/SettingsPage.test.tsx
```

Expected: one passed test and zero failures.

- [x] **Step 5: Run the complete frontend verification**

Run:

```powershell
npm test
npm run build
git diff --check
```

Expected: all tests pass, the Next.js production build exits successfully, and `git diff --check` reports no whitespace errors.

- [x] **Step 6: Commit only the implementation and regression test**

```powershell
git add -- components/settings/SettingsPage.tsx components/settings/SettingsPage.test.tsx docs/superpowers/plans/2026-07-24-remove-settings-email-verification-card.md
git commit -m "fix: remove settings email verification card"
```
