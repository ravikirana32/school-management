# P44 — Distributed QR verification rate limiting

The public report-card verification endpoint now uses Redis atomic `INCR` + first-hit `PEXPIRE` rather than a process-local map. Caller IP is SHA-256 hashed before it is used as a key, avoiding storage of raw IP in Redis key names. Limit: 30 requests per 60-second window per observed caller IP. The response includes RateLimit headers and `Retry-After` on 429.

The endpoint fails closed with HTTP 503 when Redis is unavailable. This avoids silently reverting to a per-process limiter that can be bypassed across replicas. Reverse-proxy trust configuration must be reviewed before deployment so `req.ip` cannot be spoofed. Shared NAT addresses will share a limit.

Redis integration, multi-replica behavior, proxy configuration and abuse E2E remain unverified.
