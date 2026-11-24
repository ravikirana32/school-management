# P31 Entry Criteria — Parent Portal, Delivery Workers & Runtime Acceptance

1. Implement and operate encrypted parent invitation delivery worker with retry/dead-letter, delivery status and no raw-token logging.
2. Integrate an actual malware scanning engine/queue, verify file signatures and virus verdicts, and test scanner HMAC rotation/replay protection.
3. Provision parent school membership/role only after verified guardian linking and explicit consent; expose parent-scoped student/attendance APIs with strict guardian-link filtering.
4. Build Parent mobile authentication, school/student switcher and consent/privacy controls.
5. Run P30 migration preflight and exclusion constraint on PostgreSQL; prove overlap rejection and rollback.
6. Verify parent token RLS and scanner RLS under a non-owner application role.
7. Test S3 signed URL expiry, quarantine lifecycle, clean promotion, deletion, retention and private bucket posture.
8. Run invitation acceptance race tests and guardian merge concurrency/rollback tests.
9. Run Prisma validation, full builds/typechecks, Vitest, API integration and Playwright E2E.
10. Reconcile P00–P30 gaps; close only with implementation and reproducible evidence.
