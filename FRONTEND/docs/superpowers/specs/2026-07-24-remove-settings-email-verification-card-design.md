# Remove Settings Email Verification Card

## Scope

Remove the standalone **Email Verification** status card from the shared Settings profile tab.

The change applies to every role-specific Settings page that renders `SettingsPage`.

## Design

- Delete the Email Verification card markup from `components/settings/SettingsPage.tsx`.
- Remove the `MailCheck` and `MailX` icon imports when they become unused.
- Preserve the profile information, MFA settings, password management, and appearance settings.
- Preserve the user's `emailVerified` data fields and all email-based MFA behavior; those are outside this UI-only change.

## Verification

- Add or update a focused Settings component test to assert that the standalone **Email Verification** card is absent while the surrounding profile and security controls remain.
- Run the focused test and the frontend production build.

