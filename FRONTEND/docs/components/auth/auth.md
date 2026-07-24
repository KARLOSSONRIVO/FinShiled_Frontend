# Authentication Components

## Login and temporary password

The login form sends email/password and delegates the returned temporary state to `AuthProvider`. It redirects instead of rendering an inline TOTP prompt. The temporary-password page consumes only `sessionStorage['finshield_temp_auth']`, calls the restricted password endpoint, clears the temporary state, and returns to login. The next password login begins the normal MFA challenge.

## Mandatory MFA page

`app/mfa/page.tsx` is the shared responsive checkpoint for method selection, email/authenticator code entry, resend countdown, error/loading states, and cancel-session. The authenticator option appears only after verified enrollment. There is no separate account-protection activation view.

The page never writes normal tokens. It hands only a successfully MFA-verified response to `completeMfaAuthentication`.

## MFA security settings

`components/settings/MfaSettings.tsx` shows permanent email MFA, the preferred method, optional authenticator state, and recent security activity. Add, replace, remove, and preferred-method changes run through a password plus email-code step-up dialog. Setup displays QR/manual material only until a valid TOTP confirms enrollment. No UI can disable MFA completely.

## Administrator reset

`components/user/ResetAuthenticatorDialog.tsx` is exposed only from authorized user-management controls for accounts reporting `totpEnabled`. It requires a reset reason and calls `UserService.resetAuthenticator`. Backend RBAC remains authoritative.

## PasswordChangeGate

The legacy complete-session forced-password gate remains defensive, but the mandatory first-login design normally reaches `/change-temporary-password` before any user/token is stored. Protected resources remain unavailable throughout password change and the subsequent login MFA challenge.
