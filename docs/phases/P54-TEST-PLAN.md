# P54 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-outbox-lease.test.ts`.
2. Run two workers concurrently against one PENDING row; exactly one lease claim must succeed.
3. Verify a live PROCESSING lease cannot be reclaimed; expired lease can be reclaimed once.
4. Verify terminal records never claim and never invoke provider send.
5. Kill worker after provider acceptance but before DB settlement; confirm provider idempotency key prevents duplicate email on retry.
6. Verify dead-letter state and BullMQ dead-letter record reconcile after process restart.
