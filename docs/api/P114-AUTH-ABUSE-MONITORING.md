# Authentication Abuse Monitoring API

`GET /api/v1/auth/security/abuse-summary` requires a valid bearer session and an active platform-administrator account. It returns seven UTC daily buckets for fixed counters: `login_succeeded`, `login_failed`, `rate_limited`, `refresh_reuse`, and `refresh_concurrent_reuse`.

The endpoint returns 503 when Redis summary reads fail. Counters are best-effort, have a 35-day TTL, and store no raw identity or credential data. This endpoint is operational telemetry, not a complete SIEM or alerting integration.
