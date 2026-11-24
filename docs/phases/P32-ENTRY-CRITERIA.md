# P32 Entry Criteria — Parent Portal Acceptance & Provider Operations

1. Configure and verify a real email provider adapter, delivery receipts/bounces, retries, dead-letter replay and invitation token delivery.
2. Configure and verify a real malware scanner engine, file-signature/magic-byte checks, malicious/malformed/polyglot fixtures and callback retry.
3. Apply P31 migration on clean and upgrade fixtures; prove rollback/reapply and P30 pending invitation revocation behavior.
4. Run Prisma validation/client generation, full TypeScript typechecks, builds and Vitest.
5. Run PostgreSQL RLS tests under separate non-owner API, parent delivery and scanner worker credentials; prove worker GUC cannot be used by request handlers.
6. Run invitation accept/re-consent/revoke/withdraw race tests and verify role/membership rollback.
7. Run parent cross-tenant and guardian-link negative authorization tests, including multiple guardians and withdrawn consent.
8. Run Redis/BullMQ retry, stale outbox reconciliation, idempotency and dead-letter tests.
9. Run S3 signed URL expiry, quarantine, scan promotion/rejection and private bucket acceptance.
10. Build Parent app and run iOS/Android E2E for invitation preview, exact consent, existing/new account, sign-in, school switch, child list, attendance and withdrawal.
11. Add cursor pagination for parent attendance and agree product scope for fees, homework, report cards, messaging, notifications and transport.
12. Review historical P30 consent evidence and localized/legal notice versions; define re-consent where required.
13. Reconcile all P00–P31 open gaps; close only with reproducible implementation and runtime evidence.
