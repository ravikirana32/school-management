# P59 Status — Notification endpoint rate limiting

**Status:** Source implementation and test source complete; Redis/deployment acceptance pending. **Production approval: NOT GRANTED.**

- Added atomic Redis INCR/PEXPIRE limiter with short retry, disabled offline queue and hashed scope/identity keys.
- Unauthenticated webhook ingress is limited to 120 requests/minute per configured provider and Express IP; emits rate-limit headers and 429.
- Redis limiter failure returns 503 (fail closed) before signature/database processing.
- Authenticated suppression create/release mutations are limited to 20 requests/minute per organization/school/user; no email or payload is used in rate keys.
- Static verifier 11/11 PASS; TypeScript syntax 6 files, 0 diagnostics; Redis multi-replica/outage, proxy trust and API runtime tests NOT RUN.
