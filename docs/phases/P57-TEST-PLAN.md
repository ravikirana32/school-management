# P57 Test Plan

1. Run `pnpm --filter @school-saas/api test -- src/modules/notifications/notification-pagination.test.ts`.
2. Validate Prisma schema and apply migration to disposable PostgreSQL.
3. Seed >500 suppressions with tied createdAt timestamps; page through and prove no duplicate/missing IDs.
4. Test invalid/cross-school cursors, status changes between pages and concurrent inserts/releases.
5. Run EXPLAIN ANALYZE for active/released page query and audit-event query at representative volume.
6. Run School Admin Playwright tests for Load more, status switching, keyboard navigation, screen reader labels, mobile viewport and tenant switching.
