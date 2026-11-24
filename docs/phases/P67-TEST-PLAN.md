# P67 Test Plan

1. Run API Vitest suite and School Admin Vitest suite.
2. Apply all migrations to disposable PostgreSQL; validate alias backfill and tenant/worker RLS using non-owner roles.
3. Execute every scenario in `P67-END-TO-END-REGRESSION-MATRIX.md` with Redis and mocked provider webhook.
4. Run browser E2E for suppression create/release, Load more, key-health panel and permission denial.
5. Retain SQL logs, test output, browser screenshots and sanitized worker logs.
6. Run P66 key retirement dry-run; do not remove secrets or delete alias/outbox data.
