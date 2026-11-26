# P118 — Central Server-Side MFA Enforcement

The shared API `authenticate()` middleware enforces MFA before protected route handlers execute when `MFA_ENABLED=true` and the authenticated user is a platform administrator or has a role whose key is configured in `MFA_REQUIRED_ROLE_KEYS`.

## Policy
- Global enforcement is controlled by `MFA_ENABLED` and defaults to `false`.
- When disabled, the API reports `policy.enabled=false` and `policy.required=false`, and MFA enforcement gates are bypassed across API-backed applications.
- When enabled, platform administrators are always required to use MFA.
- Additional roles are configured as comma-separated role keys in `MFA_REQUIRED_ROLE_KEYS`.
- For required users, a verified, active TOTP factor must exist.
- For required users, the current session must have `mfaVerifiedAt` within the previous 300 seconds. Future timestamps are rejected.

## Bootstrap allowlist
When global MFA enforcement is enabled, only these exact method/path pairs bypass the central gate:
- `GET /api/v1/auth/me` — identity bootstrap.
- `GET /api/v1/auth/mfa/status` — MFA policy/status discovery.
- `POST /api/v1/auth/mfa/totp/enroll` — factor enrollment.
- `POST /api/v1/auth/mfa/verify` — challenge completion.

Factor disable and session-management operations are not exempt. A required-MFA user must complete a fresh challenge before using them.

## Error contracts
- `403 MFA_ENROLLMENT_REQUIRED`: enroll at `/api/v1/auth/mfa/totp/enroll`.
- `403 MFA_CHALLENGE_REQUIRED`: verify at `/api/v1/auth/mfa/verify`.

## Coverage limitation
This gate runs for routes that call the shared `authenticate()` middleware. Public endpoints, webhook handlers and any route using a different authentication mechanism require separate review. Do not interpret this implementation as proof that every API route is protected; see P118-G002.
