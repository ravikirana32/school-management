# P66 Test Plan

1. Run API tests for key-health endpoint with current/previous versions and empty/large grouped counts.
2. Verify school membership/permission and cross-school isolation.
3. Assert response schema contains only version/status/count; no hash, email, outbox ID or secret.
4. Run Prisma validate/generate and groupBy queries against PostgreSQL with RLS non-owner role.
5. Run browser tests for loading, permission denial, responsive table and accessible labels.
6. Perform a non-production key retirement dry run using P66 runbook; do not remove previous key until active alias count and callback-eligible outbox references are zero or approved retention horizon is satisfied.
