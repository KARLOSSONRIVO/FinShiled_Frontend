# Consolidated Platform Configuration and Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge maintenance mode into Platform Configuration and make System Status polling use the saved refresh interval immediately.

**Architecture:** Keep the existing protected backend configuration and maintenance endpoints separate. Add a shared frontend configuration query, derive System Status polling from its `statusRefreshSeconds` value, and consolidate maintenance state and its typed-confirmation modal into the Platform Configuration page. Retain the old Maintenance route only as a compatibility redirect.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TanStack React Query, Radix Dialog, Tailwind CSS, Vitest, Testing Library

## Global Constraints

- Preserve `GET /system/configuration`, `PUT /system/configuration`, and `PUT /system/maintenance`.
- Preserve backend permissions, recent-MFA enforcement, rate limiting, validation, and audit logging.
- Accept refresh intervals from 15 through 300 seconds.
- Use 30 seconds only when configuration is unavailable or invalid.
- Require exact `ENABLE MAINTENANCE` and `DISABLE MAINTENANCE` confirmation phrases.
- Remove only the System Administrator Maintenance navigation entry.
- Redirect the old Maintenance frontend route to Platform Configuration.
- Preserve existing FinShield typography, colors, card styling, spacing, responsiveness, and keyboard accessibility.
- Do not stage or overwrite unrelated worktree changes.

---

## File Structure

- Create `hooks/system-admin/use-platform-configuration.ts`: shared React Query configuration hook and polling-interval normalization.
- Create `hooks/system-admin/use-system-status.test.tsx`: behavior tests for configured polling and fallback polling.
- Modify `hooks/system-admin/use-system-status.ts`: consume the shared configuration query.
- Create `app/admin/system-administrator/platform-configuration/page.test.tsx`: merged-page and maintenance-modal behavior tests.
- Modify `app/admin/system-administrator/platform-configuration/page.tsx`: monitoring settings plus maintenance control and modal.
- Create `app/admin/system-administrator/maintenance/page.test.tsx`: retired-route redirect test.
- Modify `app/admin/system-administrator/maintenance/page.tsx`: compatibility redirect only.
- Modify `app/admin/system-administrator/layout.test.tsx`: assert consolidated navigation.
- Modify `app/admin/system-administrator/layout.tsx`: remove Maintenance link and unused icon.
- Update `graphify-out/obsidian/Platform Configuration and Maintenance Consolidation.md`: final behavior and verification record.

### Task 1: Configuration-driven System Status polling

**Files:**
- Create: `hooks/system-admin/use-platform-configuration.ts`
- Create: `hooks/system-admin/use-system-status.test.tsx`
- Modify: `hooks/system-admin/use-system-status.ts`

**Interfaces:**
- Consumes: `SystemService.getConfiguration(): Promise<PlatformConfiguration>` and `SystemService.getStatus(): Promise<SystemStatus>`
- Produces: `usePlatformConfiguration()` and `getStatusRefreshIntervalMs(value?: number): number`
- Produces: `useSystemStatus()` with a dynamic React Query `refetchInterval`

- [ ] **Step 1: Write failing polling tests**

Create a real `QueryClient` wrapper and use fake timers. Mock only the HTTP-facing service methods. Verify that a configured 60-second interval does not poll at 30 seconds and does poll at 60 seconds. Verify that a rejected configuration request uses the 30-second fallback.

```tsx
it("polls System Status using the saved refresh interval", async () => {
  configurationSpy.mockResolvedValue({
    maintenanceMode: false,
    maintenanceMessage: "Scheduled maintenance",
    statusRefreshSeconds: 60,
  })

  renderHook(() => useSystemStatus(), { wrapper })
  await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(1))

  await act(async () => vi.advanceTimersByTimeAsync(30_000))
  expect(statusSpy).toHaveBeenCalledTimes(1)

  await act(async () => vi.advanceTimersByTimeAsync(30_000))
  await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(2))
})

it("falls back to 30 seconds when configuration cannot be loaded", async () => {
  configurationSpy.mockRejectedValue(new Error("unavailable"))

  renderHook(() => useSystemStatus(), { wrapper })
  await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(1))

  await act(async () => vi.advanceTimersByTimeAsync(30_000))
  await waitFor(() => expect(statusSpy).toHaveBeenCalledTimes(2))
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npx vitest run hooks/system-admin/use-system-status.test.tsx
```

Expected: FAIL because `useSystemStatus` still polls every 30 seconds and the shared configuration hook does not exist.

- [ ] **Step 3: Add the shared configuration query and interval normalization**

```ts
const DEFAULT_STATUS_REFRESH_SECONDS = 30
const MIN_STATUS_REFRESH_SECONDS = 15
const MAX_STATUS_REFRESH_SECONDS = 300

export function getStatusRefreshIntervalMs(value?: number) {
  const seconds = Number(value)
  if (!Number.isFinite(seconds) || seconds < MIN_STATUS_REFRESH_SECONDS || seconds > MAX_STATUS_REFRESH_SECONDS) {
    return DEFAULT_STATUS_REFRESH_SECONDS * 1000
  }
  return seconds * 1000
}

export function usePlatformConfiguration() {
  return useQuery({
    queryKey: ["platform-configuration"],
    queryFn: SystemService.getConfiguration,
  })
}
```

Update `useSystemStatus`:

```ts
export function useSystemStatus() {
  const { data: configuration } = usePlatformConfiguration()

  return useQuery({
    queryKey: ["system-status"],
    queryFn: SystemService.getStatus,
    refetchInterval: getStatusRefreshIntervalMs(configuration?.statusRefreshSeconds),
  })
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
npx vitest run hooks/system-admin/use-system-status.test.tsx
```

Expected: both polling tests PASS.

- [ ] **Step 5: Check the focused diff**

Run:

```powershell
git diff --check -- hooks/system-admin/use-platform-configuration.ts hooks/system-admin/use-system-status.ts hooks/system-admin/use-system-status.test.tsx
```

Expected: no whitespace errors.

### Task 2: Consolidated Platform Configuration page

**Files:**
- Create: `app/admin/system-administrator/platform-configuration/page.test.tsx`
- Modify: `app/admin/system-administrator/platform-configuration/page.tsx`

**Interfaces:**
- Consumes: `usePlatformConfiguration()` from Task 1
- Consumes: `SystemService.updateConfiguration(payload)` and `SystemService.setMaintenance(payload)`
- Produces: a single Platform Configuration page with monitoring settings and maintenance mode

- [ ] **Step 1: Write failing merged-page tests**

Use a real `QueryClient` and mock only `SystemService` network methods. Cover normal operation and active maintenance in separate tests.

```tsx
it("opens an enable-maintenance modal and requires the exact phrase", async () => {
  configurationSpy.mockResolvedValue(normalConfiguration)
  render(<PlatformConfigurationPage />, { wrapper })

  fireEvent.click(await screen.findByRole("button", { name: "Enable maintenance" }))
  const confirmButton = screen.getByRole("button", { name: "Confirm enable maintenance" })
  expect(confirmButton).toBeDisabled()

  fireEvent.change(screen.getByLabelText("Type ENABLE MAINTENANCE to continue"), {
    target: { value: "ENABLE MAINTENANCE" },
  })
  expect(confirmButton).toBeEnabled()
})

it("sends the protected enable-maintenance payload", async () => {
  configurationSpy.mockResolvedValue(normalConfiguration)
  maintenanceSpy.mockResolvedValue({ ok: true })
  render(<PlatformConfigurationPage />, { wrapper })

  fireEvent.click(await screen.findByRole("button", { name: "Enable maintenance" }))
  fireEvent.change(screen.getByLabelText("Type ENABLE MAINTENANCE to continue"), {
    target: { value: "ENABLE MAINTENANCE" },
  })
  fireEvent.click(screen.getByRole("button", { name: "Confirm enable maintenance" }))

  await waitFor(() => expect(maintenanceSpy).toHaveBeenCalledWith({
    enabled: true,
    message: normalConfiguration.maintenanceMessage,
    confirmation: "ENABLE MAINTENANCE",
  }))
})

it("requires DISABLE MAINTENANCE while maintenance is active", async () => {
  configurationSpy.mockResolvedValue({
    ...normalConfiguration,
    maintenanceMode: true,
  })
  render(<PlatformConfigurationPage />, { wrapper })

  fireEvent.click(await screen.findByRole("button", { name: "Disable maintenance" }))
  expect(screen.getByLabelText("Type DISABLE MAINTENANCE to continue")).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the page test and verify RED**

Run:

```powershell
npx vitest run app/admin/system-administrator/platform-configuration/page.test.tsx
```

Expected: FAIL because the maintenance card and confirmation modal are absent.

- [ ] **Step 3: Implement the consolidated page**

Replace the page-local configuration query with `usePlatformConfiguration`. Retain the existing configuration form and add:

```tsx
const enabled = Boolean(data?.maintenanceMode)
const expectedMaintenanceConfirmation = enabled
  ? "DISABLE MAINTENANCE"
  : "ENABLE MAINTENANCE"
const maintenanceAction = enabled ? "disable" : "enable"
```

Use the existing Radix dialog components:

```tsx
<Dialog open={maintenanceDialogOpen} onOpenChange={handleMaintenanceDialogChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{enabled ? "Disable maintenance mode" : "Enable maintenance mode"}</DialogTitle>
      <DialogDescription>
        {enabled
          ? "Business API operations will resume."
          : "Business API operations will be blocked while technical administration remains available."}
      </DialogDescription>
    </DialogHeader>
    <Label htmlFor="maintenance-confirmation">
      Type {expectedMaintenanceConfirmation} to continue
    </Label>
    <Input
      id="maintenance-confirmation"
      value={maintenanceConfirmation}
      onChange={(event) => setMaintenanceConfirmation(event.target.value)}
    />
    <DialogFooter>
      <Button variant="outline" onClick={() => handleMaintenanceDialogChange(false)}>Cancel</Button>
      <Button
        aria-label={`Confirm ${maintenanceAction} maintenance`}
        disabled={maintenanceConfirmation !== expectedMaintenanceConfirmation || maintenanceMutation.isPending}
        onClick={() => maintenanceMutation.mutate()}
      >
        {enabled ? "Disable maintenance" : "Enable maintenance"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

On success, close the modal, clear confirmation text, display the matching toast, and invalidate `["platform-configuration"]`.

Add a page-level load error:

```tsx
if (isError) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
      Platform configuration could not be loaded.
    </div>
  )
}
```

Validate the interval before enabling Save:

```ts
const validInterval = Number.isInteger(seconds) && seconds >= 15 && seconds <= 300
```

- [ ] **Step 4: Run the page test and verify GREEN**

Run:

```powershell
npx vitest run app/admin/system-administrator/platform-configuration/page.test.tsx
```

Expected: merged-page tests PASS.

- [ ] **Step 5: Check the focused diff**

Run:

```powershell
git diff --check -- app/admin/system-administrator/platform-configuration/page.tsx app/admin/system-administrator/platform-configuration/page.test.tsx
```

Expected: no whitespace errors.

### Task 3: Consolidated navigation and retired-route redirect

**Files:**
- Modify: `app/admin/system-administrator/layout.test.tsx`
- Modify: `app/admin/system-administrator/layout.tsx`
- Create: `app/admin/system-administrator/maintenance/page.test.tsx`
- Modify: `app/admin/system-administrator/maintenance/page.tsx`

**Interfaces:**
- Consumes: Next.js `redirect(path: string): never`
- Produces: one Platform Configuration sidebar destination and a compatibility redirect

- [ ] **Step 1: Extend the navigation test**

```tsx
it("shows Platform Configuration once and omits the separate Maintenance destination", () => {
  render(<SystemAdministratorLayout><div>Page content</div></SystemAdministratorLayout>)

  const sidebar = screen.getByRole("navigation", { name: "System Administrator sidebar" })
  expect(within(sidebar).getAllByRole("link", { name: "Platform Configuration" })).toHaveLength(1)
  expect(within(sidebar).queryByRole("link", { name: "Maintenance" })).not.toBeInTheDocument()
})
```

Create the route test:

```tsx
const redirectSpy = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: redirectSpy,
}))

it("redirects the retired Maintenance route to Platform Configuration", () => {
  MaintenancePage()
  expect(redirectSpy).toHaveBeenCalledWith(
    "/admin/system-administrator/platform-configuration",
  )
})
```

- [ ] **Step 2: Run both tests and verify RED**

Run:

```powershell
npx vitest run app/admin/system-administrator/layout.test.tsx app/admin/system-administrator/maintenance/page.test.tsx
```

Expected: FAIL because Maintenance remains in navigation and its page still renders standalone controls.

- [ ] **Step 3: Remove the navigation entry and redirect the old page**

Remove the Maintenance link and unused `Wrench` import from `layout.tsx`.

Replace the retired page with:

```tsx
import { redirect } from "next/navigation"

export default function MaintenancePage() {
  redirect("/admin/system-administrator/platform-configuration")
}
```

- [ ] **Step 4: Run both tests and verify GREEN**

Run:

```powershell
npx vitest run app/admin/system-administrator/layout.test.tsx app/admin/system-administrator/maintenance/page.test.tsx
```

Expected: both navigation and redirect tests PASS.

- [ ] **Step 5: Check the focused diff**

Run:

```powershell
git diff --check -- app/admin/system-administrator/layout.tsx app/admin/system-administrator/layout.test.tsx app/admin/system-administrator/maintenance/page.tsx app/admin/system-administrator/maintenance/page.test.tsx
```

Expected: no whitespace errors.

### Task 4: Regression verification and final documentation

**Files:**
- Update: `graphify-out/obsidian/Platform Configuration and Maintenance Consolidation.md`
- Update: Graphify outputs through `graphify update`

**Interfaces:**
- Consumes: completed Tasks 1–3
- Produces: verified implementation and final project documentation

- [ ] **Step 1: Run all focused frontend tests together**

```powershell
npx vitest run hooks/system-admin/use-system-status.test.tsx app/admin/system-administrator/platform-configuration/page.test.tsx app/admin/system-administrator/layout.test.tsx app/admin/system-administrator/maintenance/page.test.tsx
```

Expected: all focused tests PASS with no unhandled errors.

- [ ] **Step 2: Run the full frontend suite**

```powershell
npm test
```

Expected: all frontend tests PASS.

- [ ] **Step 3: Run TypeScript and production-build verification**

```powershell
npx tsc --noEmit
npm run build
```

Expected: both commands exit with code 0.

- [ ] **Step 4: Run backend regression tests**

From `FinShield/BACKEND`:

```powershell
npm test
```

Expected: all backend tests PASS, confirming that protected configuration and maintenance contracts remain intact.

- [ ] **Step 5: Update the Obsidian implementation record**

Change the note status to `Implemented and verified`, document the final affected files, confirmation behavior, dynamic polling behavior, and exact verification commands/results.

- [ ] **Step 6: Refresh Graphify**

From the CAPSTONE root:

```powershell
graphify update
```

Expected: `graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json` represent the completed implementation.

- [ ] **Step 7: Run final whitespace and scope checks**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; unrelated pre-existing worktree changes remain untouched.
