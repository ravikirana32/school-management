# P50 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-webhook-signature.test.ts src/modules/notifications/notification-webhook-contract.test.ts`.
2. Test exact raw-body signing and reject changed bytes, stale/future timestamps, duplicate t/v1, unknown fields, malformed hex, exponent timestamps, and short secrets.
3. Test canonical event schema boundaries, unknown fields, timezone-aware timestamps and all three event-state mappings.
4. Add route integration tests for configuration absent, provider allowlist, raw-body parser ordering, signed valid events, replay, concurrency, out-of-order events and transaction rollback.
5. Execute integration suite against disposable PostgreSQL and non-owner RLS role; retain logs and sanitized traces.
