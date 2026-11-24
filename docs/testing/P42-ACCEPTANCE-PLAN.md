# P42 acceptance plan

## Source checks completed

- TypeScript syntax transpilation for parent routes, cursor helper, helper test and Parent mobile app.
- Dependency-free cursor helper smoke tests: encode/decode round trip, malformed/version rejection, page-size boundaries and snapshot predicate shape.
- Static source assertions for route guards, tenant/recipient scoping, snapshot watermark, cursor anchor validation, read-all, mobile load-more and school-switch reset.
- Prisma schema/migration index parity and archive integrity checks.

## Required runtime acceptance (not run)

1. Apply P00–P42 migrations to a disposable PostgreSQL database; rollback and reapply P42 index migration.
2. Run Prisma validate/generate and verify the generated index metadata.
3. Test as non-owner/non-BYPASSRLS credentials: same-school parent, another-school parent, revoked consent, inactive guardian and cross-tenant cursor.
4. Seed more than 100 notices; verify page size, stable order, no duplicates, watermark exclusion of concurrent inserts, cursor tampering/staleness and deleted-anchor refresh behavior.
5. Verify unread counts before/after individual read, read-all, new notice insertion and consent withdrawal.
6. Run Parent mobile Playwright/Expo device tests for load more, unread badge, mark all read, school switch and session refresh.
7. Run k6 for inbox first page and continuation under representative school/recipient cardinality.

No runtime database, API, mobile-device or load test is claimed by this phase.
