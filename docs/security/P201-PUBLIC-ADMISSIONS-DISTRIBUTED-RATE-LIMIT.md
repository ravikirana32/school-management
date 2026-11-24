# P201 — Public Admissions Distributed Abuse Protection

## Change
- Replaced the public admissions process-local IP/path counter with a shared Redis-backed fixed-window limiter.
- Limit identity includes organization, school, route pattern and client IP; values are hashed before being used as Redis key material.
- Routes use the same limiter: enquiries, public draft applications, status, token rotation, documents, upload completion and submission.
- Redis INCR + first-hit PEXPIRE is executed atomically via Lua.
- Limit remains 12 requests per route/IP/school per 60 seconds; `Retry-After` is returned on 429.
- Limiter fails closed with HTTP 503 if Redis is unavailable instead of silently bypassing abuse protection.
- Dynamic path values are normalized by Express route path, avoiding token-specific Redis keys.

## Limitations / remaining gaps
- This is a shared fixed-window limiter, not a sliding-window algorithm; boundary bursts remain possible.
- IP identity relies on correctly configured Express proxy trust; deployment must review `trust proxy` to avoid spoofed IPs or collapsing clients behind proxies.
- Redis persistence/availability, failover and capacity must be operationally reviewed.
- CAPTCHA, guardian contact verification, public token recovery, and full security/runtime acceptance are not implemented in this phase.
- No build, typecheck, API tests, E2E, or runtime validation is claimed.
