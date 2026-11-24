# P33 Entry Criteria — Parent Portal Features & Runtime Acceptance

1. Implement parent-facing fees, homework/assignments, report cards, notifications and messaging only after product and privacy scope is approved.
2. Add API integration tests for cursor pagination, invalid/foreign cursors, date boundaries, duplicate timestamps, correction races and consent withdrawal between pages.
3. Run Prisma validation/client generation and full TypeScript typecheck/build.
4. Run PostgreSQL migration, RLS and cross-tenant tests using separate non-owner API and worker credentials.
5. Configure and verify real email delivery receipts/bounces and scanner engine magic-byte/malware checks.
6. Run Redis/BullMQ retry, outbox reconciliation, idempotency and dead-letter replay tests.
7. Run private S3 upload/download, quarantine, scan promotion/rejection and expiry tests.
8. Build Parent app and execute iOS/Android invitation, authentication, school switching, linked child, attendance pagination and consent withdrawal E2E.
9. Review consent notice localization/legal requirements, historical P30 consent, key rotation, preview rate limits and parent account recovery.
10. Reconcile all P00–P32 open gaps; close only with reproducible implementation and runtime evidence.
