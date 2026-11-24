# P349 — Admissions Public Security Completion

## Scope and implementation
- Hardened all public admissions responses with explicit private/no-store cache controls, legacy cache directives, and `Referrer-Policy: no-referrer`.
- This reduces the chance that applicant/guardian data or token-scoped admissions content is retained by browser/shared caches or exposed through referrer headers.
- Existing public-route protections were audited and source-checked: Redis-backed IP/organization/school/route rate limiting (fail-closed), school-active validation, tenant-scoped token lookup, hashed tracking tokens, token expiry/revocation, applicant OTP expiry/attempt limits, hashed applicant-account bearer sessions with expiry, CORS origin allowlist, and Helmet.
- No database/schema migration and no new mutation routes.

## Targeted source verification
`node scripts/verify-p349-admissions-public-security.mjs` — **12/12 PASS**.

This verifier checks source-level safeguards; it is not a runtime test, penetration test, or security certification.

## Open security/runtime gaps
- Public token-in-URL exposure risk in access/request logs and observability remains; evaluate token header migration with compatibility planning.
- Runtime verification of Redis limiter behavior, reverse-proxy/IP configuration, rate-limit bypass attempts, OTP abuse, object-storage upload validation, and cross-school isolation remains deferred.
- API build/typecheck, browser/app build, physical mobile/device acceptance, and full E2E/regression validation remain deferred to Cycle 2.
- External penetration test/security review remains open.
