# Auth and Session Services

`services/auth.service.ts` separates three credential scopes:

- Normal bearer access for authenticated resources.
- `X-Temporary-Auth` for password change, login challenge, and settings-email verification.
- `X-MFA-Step-Up` for a single authorized security-setting action.

## Password and login

| Method | Endpoint | Result |
|---|---|---|
| `login(credentials)` | `POST /auth/login` | Restricted `TemporaryAuthResponse`; never a full session |
| `changeTemporaryPassword(token, payload)` | `POST /auth/temporary/change-password` | Completes forced change, invalidates temporary state, and requires fresh login |
| `refreshToken(refreshToken)` | `POST /auth/refresh` | Rotated authenticated token pair |
| `logout()` | `POST /auth/logout` | Revokes the stored refresh session |
| `getMe()` | `GET /auth/me` | Safe current-user profile |
| `changePassword(payload)` | `POST /auth/change-password` | Changes a routine password and invalidates stale auth versions |

## Login MFA

| Method | Endpoint |
|---|---|
| `getMfaMethods(tempToken)` | `GET /auth/mfa/methods` |
| `selectMfaMethod(tempToken, method)` | `POST /auth/mfa/methods/select` |
| `requestEmailCode(tempToken)` | `POST /auth/mfa/email/request` |
| `verifyMfa(tempToken, { code, method })` | `POST /auth/mfa/verify` |
| `cancelMfaSession(tempToken)` | `POST /auth/mfa/session/cancel` |

Email is always included. `authenticator` is offered only when the backend reports it in `enabledMfaMethods`.

## MFA settings step-up

| Method | Purpose |
|---|---|
| `getMfaSettings()` | Safe status and recent activity |
| `authorizeMfaSetting({ password, action })` | Confirm the password and send an email challenge |
| `verifyMfaSettingAuthorization(tempToken, code)` | Receive an action-scoped step-up credential |
| `startAuthenticatorSetup(stepUpToken)` | Receive pending QR/manual setup material |
| `completeAuthenticatorSetup(stepUpToken, code)` | Prove possession and activate encrypted TOTP |
| `removeAuthenticator(stepUpToken)` | Remove TOTP while preserving email MFA |
| `changePreferredMfaMethod(stepUpToken, method)` | Prefer an already enabled method |

There is intentionally no operation that turns MFA off.

`session.service.ts` continues to list and revoke authenticated refresh sessions. Temporary authentication sessions are controlled through the MFA service and are not dashboard sessions.
