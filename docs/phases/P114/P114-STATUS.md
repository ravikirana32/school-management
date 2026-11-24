# P114 — Account Protection and Abuse Monitoring

**Status:** Source implementation complete; runtime acceptance pending.

## Implemented
- Redis daily counters for login success/failure, rate-limit denials, refresh-token reuse and concurrent reuse.
- Fixed event allowlist; no raw email, IP, user ID, password or token is stored in metric values.
- 35-day Redis retention and seven-day UTC summary.
- `GET /api/v1/auth/security/abuse-summary`, protected by bearer authentication and platform-admin authorization.
- Metrics are best-effort and cannot change authentication outcomes.

## Not implemented / not verified
- Alert routing, on-call integration, dashboard UI and progressive account lockout/adaptive challenge.
- Redis runtime, authorization negative tests, counter rollover/expiry, API runtime and production observability.
- Unit/API/browser/mobile test execution remains deferred by project instruction.
