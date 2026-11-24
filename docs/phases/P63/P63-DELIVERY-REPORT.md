# P63 Delivery Report

1. Added nullable recipientEmailHash and recipientEmailHashVersion to NotificationOutbox with additive migration.
2. Worker writes current-key recipient HMAC/version under its PROCESSING lease before calling the provider.
3. Webhook route preflights provider event/outbox under notification worker read context, then uses the resolved organization/school tenant context for event, outbox and suppression writes.
4. BOUNCED/COMPLAINED events create tenant-local BOUNCE/COMPLAINT suppression using the stored hash only.
5. Uses partial unique index conflict handling to make suppression creation idempotent; creates audit event only when insertion succeeds.
6. Added bounce/complaint/legacy-outbox route test source and static verifier.

No plaintext recipient email is persisted. Runtime tests remain unverified.
