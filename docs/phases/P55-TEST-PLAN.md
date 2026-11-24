# P55 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/config/log-redaction.test.ts src/modules/notifications/notification-safe-error.test.ts`.
2. Serialize nested request/error objects containing sentinel email, HMAC, signature, cookie, bearer token, raw body and verification code; assert none appear in logs.
3. Verify safe summaries retain only allowlisted HTTP status and generic transport failure.
4. Inspect BullMQ dead-letter payloads and persisted lastError for absence of PII/secrets/provider response bodies.
5. Validate collector/sidecar redaction and retention in the production-like environment.
