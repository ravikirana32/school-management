# P117 MFA Policy Contract

`GET /api/v1/auth/mfa/status` now returns `data.policy`:

- `required`: whether the authenticated user is subject to MFA policy.
- `reasons`: `PLATFORM_ADMIN` and/or `ROLE:<role-key>`.
- `challengeRequired`: enrolled factor exists but this session is not verified within five minutes.
- `enrollmentRequired`: policy applies but no verified TOTP factor exists.
- `sessionFresh`: current session has a recent MFA verification timestamp.
- `freshnessSeconds`: currently 300 seconds.

Platform administrators are always included. Additional role keys are configured with comma-separated `MFA_REQUIRED_ROLE_KEYS`. The policy response is informational to clients and the current client flows gate workspace access; it is not a global API authorization middleware. Privileged platform-admin routes retain their server-side MFA middleware.

Enrollment: `POST /auth/mfa/totp/enroll`, then `POST /auth/mfa/verify` with the authenticator code. Challenge: `POST /auth/mfa/verify` with TOTP or recovery code.
