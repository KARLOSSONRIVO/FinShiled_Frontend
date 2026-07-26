# Remove System Administrator Sidebar Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the duplicate Profile link from the System Administrator sidebar while preserving Profile access through the top-bar account dropdown.

**Architecture:** Keep the existing System Administrator layout and settings route. Change only the sidebar navigation configuration; `TopBar` continues receiving `/admin/system-administrator/settings` through its `profileLink` property.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest

## Global Constraints

- Do not remove or rename `/admin/system-administrator/settings`.
- Preserve the top-bar Profile dropdown link.
- Do not change navigation for other roles.

---

### Task 1: Remove the duplicate sidebar entry

**Files:**
- Modify: `app/admin/system-administrator/layout.tsx`
- Test: `app/admin/system-administrator/layout.test.tsx`

**Interfaces:**
- Consumes: `AppSidebar` navigation links and `TopBar.profileLink`
- Produces: a System Administrator sidebar without `Profile`, while the top bar retains `/admin/system-administrator/settings`

- [x] **Step 1: Write the failing test**

Render `SystemAdministratorLayout` with mocked layout dependencies. Assert that the links supplied to `AppSidebar` do not contain `Profile`, and that `TopBar` receives `/admin/system-administrator/settings`.

- [x] **Step 2: Run the targeted test to verify it fails**

Run: `npm test -- app/admin/system-administrator/layout.test.tsx`

Expected: FAIL because the sidebar links still contain `Profile`.

- [x] **Step 3: Write the minimal implementation**

Remove the `{ href: /admin/system-administrator/settings, label: Profile, icon: UserRound }` item and the now-unused `UserRound` icon import. Keep `TopBar profileLink=/admin/system-administrator/settings` unchanged.

- [x] **Step 4: Run the targeted test and frontend build**

Run: `npm test -- app/admin/system-administrator/layout.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: exit code 0.
