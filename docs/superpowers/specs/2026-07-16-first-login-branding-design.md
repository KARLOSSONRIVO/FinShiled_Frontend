# First-login branding design

## Goal

Replace the plain white shield on the first-login temporary-password page with the established FinShield brand lockup.

## Design

- Render the existing `/assets/image/FinShield.svg` asset in its original colors.
- Increase the shield from `h-14` to `h-20` so it has stronger presence on the dark panel.
- Place a bold white `FinShield` wordmark beside the shield, matching the brand construction used in the application sidebar.
- Keep the existing dark panel, spacing system, responsive behavior, and password-change flow unchanged.
- On smaller screens, retain the current compact logo treatment because the reported issue concerns the large dark desktop panel.

## Implementation boundary

Only the desktop branding block in `FRONTEND/app/change-temporary-password/page.tsx` changes. No new image asset, shared-component refactor, or authentication behavior change is included.

## Verification

- Add a focused regression test that asserts the desktop brand image no longer applies the monochrome filter and that the `FinShield` wordmark is rendered.
- Run the focused page test, the frontend test suite, and the production build.
- Render the local page at desktop width and visually confirm the original-color enlarged shield and white wordmark appear together.
