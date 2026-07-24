# Mandatory MFA Frontend Contract

The frontend mirrors the backend's restricted authentication state machine and never infers authentication from password success.

## Screens

- `/change-temporary-password`: restricted forced-password replacement.
- `/mfa`: method choice, email/authenticator challenge, resend countdown, cancel session. Registered email MFA is already active, so no separate activation view exists.
- Security settings: permanent email status, preferred method, authenticator add/remove/replace, recent activity.
- User management reset dialog: reason-required administrator authenticator reset.

All screens use FinShield's cream, charcoal, emerald, typography, spacing, button, form, toast, and responsive conventions. Method selection keeps email as default primary; if authenticator is preferred it becomes primary while email moves under **More options**.

## Storage and credentials

`finshield_temp_auth` is session storage only. Temporary credentials use `X-Temporary-Auth`; action-scoped setting credentials use `X-MFA-Step-Up`. Access/refresh tokens and the cookie are written only after the backend returns `AUTHENTICATED`. API refresh logic excludes all temporary and MFA endpoints.

## Tests

Component coverage asserts email primary/fallback behavior, conditional authenticator visibility, preferred authenticator presentation, and rejection of the removed activation state. Service coverage asserts scoped headers so temporary and step-up tokens cannot be confused with normal bearer authentication.
