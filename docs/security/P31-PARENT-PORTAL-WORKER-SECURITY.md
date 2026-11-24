# P31 Parent Portal & Worker Security

- Parent data is not authorized by school membership alone. API checks the PARENT role and specific permission, active organization/school membership, verified guardian, accepted invitation, non-withdrawn consent and student-guardian communication link.
- Invitation token preview uses POST body, not query string. Email link places the opaque token in the URL fragment to avoid ordinary HTTP access logs. Tokens are hash-looked-up and never returned from staff APIs.
- Existing accounts must prove their password during invitation acceptance. New account creation and membership/role provisioning occur transactionally after token and consent validation.
- Consent withdrawal removes school parent role assignment, changes membership to LEFT, retains school-managed communication preferences and stores the consent withdrawal timestamp/audit event.
- Delivery payload is AES-256-GCM encrypted at rest. Worker decrypts only at dispatch time, uses HTTPS provider transport, idempotency key, bounded timeout, retries and dead-letter handling. Key rotation and provider configuration remain deployment tasks.
- Parent and document worker RLS policies use transaction-local GUCs. Deploy workers separately with dedicated database credentials and restrict service process access. A GUC policy alone is not an identity boundary.
- Scanner download URLs expire after 120 seconds. Scanner callback HMAC includes timestamp and exact raw body with a five-minute tolerance. Callback only accepts QUARANTINED state and is therefore one-time after successful transition.
- CLEAN-only document download remains enforced. The scanner provider must validate actual file signatures/magic bytes, malware and malformed/polyglot payloads; the API adapter cannot substitute for the scanner engine.
- Consent notice is versioned and displayed before acceptance. Consent withdrawal and access are school scoped.
- Runtime RLS, credential separation, provider idempotency, key rotation, mobile secure-store and scanner tests remain pending.
