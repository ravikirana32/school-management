# P51 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/delivery-webhook.routes.test.ts`.
2. Confirm test mocks isolate Prisma and tenant context without making network/database calls.
3. Add PostgreSQL integration tests for concurrent identical provider events, transaction rollback, unique conflict, cross-school RLS and out-of-order event commits.
4. Verify raw-body middleware is registered before webhook router and that whitespace/key-order changes invalidate a signature unless signed over those exact bytes.
5. Retain CI test output; do not close runtime gaps based on source-only verification.
