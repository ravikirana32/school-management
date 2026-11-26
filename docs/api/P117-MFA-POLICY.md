# P117 MFA Policy Contract

`GET /api/v1/auth/mfa/status` now returns `data.policy`:

- `enabled`: whether the global MFA enforcement flag is on.
- `required`: whether the authenticated user is subject to MFA policy.
- `reasons`: `PLATFORM_ADMIN` and/or `ROLE:<role-key>`.
- `challengeRequired`: enrolled factor exists but this session is not verified within five minutes.
- `enrollmentRequired`: policy applies but no verified TOTP factor exists.
- `sessionFresh`: current session has a recent MFA verification timestamp.
- `freshnessSeconds`: currently 300 seconds.

Global enforcement is controlled by `MFA_ENABLED`, which defaults to `false`. When enabled, platform administrators are always included and additional role keys can be configured with comma-separated `MFA_REQUIRED_ROLE_KEYS`. The API enforces the active policy server-side; clients use the status response to decide whether to show the enrollment or challenge flow.

Enrollment: `POST /auth/mfa/totp/enroll`, then `POST /auth/mfa/verify` with the authenticator code. Challenge: `POST /auth/mfa/verify` with TOTP or recovery code.
