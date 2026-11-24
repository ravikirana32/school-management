# P118 Status — Central Server-Side MFA Enforcement

**Status:** Central source enforcement implemented; runtime acceptance pending.

## Implemented
- Shared `authenticate()` middleware now evaluates mandatory MFA policy before protected route handlers execute.
- Platform administrators are always MFA-required.
- Additional role keys are evaluated server-side using `MFA_REQUIRED_ROLE_KEYS` and the authenticated user's role assignments.
- A verified, active TOTP factor and a session MFA verification timestamp no older than five minutes are required.
- Future-dated MFA verification timestamps are rejected.
- Explicit bootstrap allowlist: `GET /me`, `GET /mfa/status`, `POST /mfa/totp/enroll`, and `POST /mfa/verify`.
- Missing-factor and stale-challenge responses provide stable machine-readable error codes and next-step endpoints.
- Factor disable and session-management endpoints are not exempt; they require fresh MFA when policy applies.

## Coverage boundary
Enforcement applies to protected routes that invoke the shared `authenticate` middleware. P118 does not claim every API handler has been audited for authentication coverage. Public verification routes and notification webhooks remain separate and must be assessed according to their own trust model. P118-G002 tracks the complete router inventory and any alternate authentication paths.

## Verification limits
- Source verifier is static and checks implementation invariants only.
- No unit/API/browser/mobile test cases were created or run, per project instruction.
- No Prisma migration was needed for this middleware-only change.
- Database/runtime behavior, route inventory, authorization behavior, semantic TypeScript typecheck, builds and deployment remain unverified.
