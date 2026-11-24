# P115 — Progressive Account Protection and Security Alerts

**Status:** Source implementation complete; Redis/API runtime acceptance pending.

## Implemented
- Progressive login cooldown keyed by a SHA-256 digest of normalized account plus source IP; raw identifiers are not used in Redis keys.
- Cooldown starts after five failed attempts in a 15-minute counter window (60 seconds); at eight failures it increases to five minutes.
- Successful authentication clears the matching account/IP failure and cooldown keys.
- Login cooldown returns the same generic 401 response as invalid credentials to avoid account-existence disclosure.
- Threshold-deduplicated Redis Stream security alert events for repeated login failures, rate-limit denials, refresh-token reuse, concurrent reuse and cooldown activation.
- Platform-admin abuse summary now includes up to 50 recent allowlisted alert events; event payloads contain only event labels, aggregate counts and timestamps.
- Alert stream and deduplication keys expire after 35 days.

## Not implemented / not verified
- External email/SMS/on-call alert delivery and operational dashboard UI.
- MFA/adaptive challenge escalation and verified false-positive recovery workflow.
- Redis runtime, threshold/cooldown integration tests, authorization-negative tests and production proxy/IP trust validation.
- Unit/API/browser/mobile test execution remains deferred by project instruction.
