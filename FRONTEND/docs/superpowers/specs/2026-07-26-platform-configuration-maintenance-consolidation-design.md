# Platform Configuration and Maintenance Consolidation

Date: 2026-07-26

## Goal

Consolidate the System Administrator's maintenance controls into the existing Platform Configuration page and make the configured System Status refresh interval control frontend polling immediately.

## Scope

- Keep **Platform Configuration** as the single navigation destination for safe runtime configuration and maintenance mode.
- Remove the separate **Maintenance** sidebar item.
- Preserve the existing backend configuration and maintenance endpoints, permissions, recent-MFA checks, rate limiting, validation, and audit events.
- Redirect the retired Maintenance page to Platform Configuration so existing bookmarks do not fail.
- Replace the hardcoded 30-second System Status polling interval with the saved `statusRefreshSeconds` setting.

## Architecture

The backend contracts remain separate:

- `GET /system/configuration` reads the current configuration and maintenance state.
- `PUT /system/configuration` updates the maintenance message and System Status refresh interval.
- `PUT /system/maintenance` enables or disables maintenance mode through the protected workflow.

The frontend will share one React Query configuration query across Platform Configuration and System Status. The System Status hook will derive its polling interval from `statusRefreshSeconds`, converted to milliseconds. It will use 30 seconds only while configuration is unavailable or invalid. Invalid client values will be constrained to the backend-supported range of 15–300 seconds.

Invalidating the `platform-configuration` query after a successful save updates every active consumer. React Query will then apply the new System Status interval without requiring a browser reload.

## Platform Configuration Page

The page will contain two clearly separated cards.

### Monitoring settings

- Maintenance message
- Status refresh interval in seconds
- Existing `UPDATE PLATFORM CONFIGURATION` typed confirmation
- Save changes action
- Existing 15–300 second validation range

### Maintenance mode

- Current state: **Normal operation** or **Maintenance active**
- Current maintenance message
- A single state-aware button:
  - **Enable maintenance** during normal operation
  - **Disable maintenance** while maintenance mode is active

The page will continue using the current FinShield typography, color tokens, card styling, and spacing. The maintenance-state card will use the established neutral/green presentation for normal operation and the established amber warning treatment for active maintenance.

## Maintenance Confirmation Modal

The maintenance button opens an accessible modal. The modal explains the impact of the requested action and requires the System Administrator to enter the exact server-approved phrase:

- `ENABLE MAINTENANCE` when enabling
- `DISABLE MAINTENANCE` when disabling

The confirmation action remains disabled until the phrase matches exactly. Closing the modal clears the typed phrase. A successful request closes the modal, clears the phrase, shows a state-specific success message, and refreshes the shared configuration query. A failed request leaves the modal available and displays the sanitized backend error.

## Navigation and Route Compatibility

- Remove the Maintenance entry from the System Administrator sidebar.
- Keep Platform Configuration in its existing location.
- Change `/admin/system-administrator/maintenance` into a redirect to `/admin/system-administrator/platform-configuration`.
- Do not change backend routes or permissions.

## System Status Refresh Data Flow

1. A System Administrator opens the System Dashboard or System Status page.
2. The shared configuration query loads `statusRefreshSeconds`.
3. The System Status query converts the value to milliseconds and uses it as `refetchInterval`.
4. The System Administrator saves a different interval on Platform Configuration.
5. The save mutation invalidates the shared configuration query.
6. Active System Status consumers receive the updated interval immediately.

The interval changes only monitoring frequency. It does not change service health, maintenance state, background jobs, or backend probe behavior.

## Error Handling

- Show the existing loading skeleton while configuration loads.
- Show a clear page-level error state if configuration cannot be loaded.
- Disable configuration saving for invalid messages, invalid intervals, incorrect confirmation text, or pending requests.
- Keep maintenance mutation failures inside the modal workflow and display only the sanitized API message.
- Use 30 seconds as a safe polling fallback if configuration cannot be loaded.

## Security Decisions

- Maintenance remains enforced by `maintenance.manage` on the backend.
- Configuration remains enforced by `platform_configuration.manage` on the backend.
- Both mutations retain recent-MFA enforcement and administrative rate limiting.
- The frontend modal supplements but does not replace backend typed-confirmation validation.
- Maintenance changes continue producing internal audit events.
- Configuration changes continue producing internal audit events.
- No sensitive configuration values or raw technical errors are added to either page.

## Testing Plan

Frontend tests will verify:

- The System Administrator sidebar contains Platform Configuration but no Maintenance link.
- The retired Maintenance route redirects to Platform Configuration.
- Platform Configuration displays the current maintenance state and state-aware button.
- Clicking the maintenance button opens a modal.
- The confirmation action is disabled until the exact expected phrase is entered.
- Enabling and disabling send the correct protected request payload.
- A successful maintenance change refreshes the configuration query.
- The System Status hook uses the saved interval instead of a hardcoded 30 seconds.
- A configuration change updates the active polling interval without a browser reload.
- An unavailable or invalid configuration value falls back to 30 seconds.

Verification will include focused Vitest tests, the full frontend test suite, TypeScript checking, and a production build. Backend tests will be run to confirm that the unchanged protected endpoints and maintenance middleware continue to pass.
