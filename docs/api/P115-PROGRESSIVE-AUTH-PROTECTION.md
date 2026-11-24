# P115 Progressive Authentication Protection

## Login cooldown
`POST /api/v1/auth/login` runs the normal IP/account limiter followed by a progressive cooldown check. Failure counts are keyed by SHA-256 of normalized account + source IP. The 15-minute counter starts a 60-second cooldown at five failures and a five-minute cooldown at eight failures. A successful login clears the matching counter/cooldown. Cooldown responses are generic 401 responses.

## Security alert events
Threshold events are written to Redis Stream `auth:security:alerts`, with a 35-day retention window and one deduplicated event per UTC day/event label. Events contain only an allowlisted label, aggregate count and timestamp. No account, IP, user, password or token identifiers are included.

## Operations
`GET /api/v1/auth/security/abuse-summary` remains platform-admin-only and now includes up to 50 recent alert events. This is an event feed only; delivery to email, SMS, PagerDuty or another on-call provider must be separately configured.
