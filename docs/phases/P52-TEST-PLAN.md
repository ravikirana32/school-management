# P52 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-event-reconciliation.test.ts`.
2. Verify PENDING→DELIVERED, DELIVERED→BOUNCED, BOUNCED→COMPLAINED, and no BOUNCED/COMPLAINED→DELIVERED regression.
3. Verify older events are retained in ledger but cannot update summary state.
4. Run PostgreSQL concurrent event ingestion and transaction rollback tests; assert unique provider/event identity and consistent summary state.
5. Verify provider-specific event ordering against the selected vendor sandbox before claiming compatibility.
