# P35 Acceptance Plan

## Static/source checks completed

- TypeScript syntax transpilation for pagination helper, helper test, parent routes and School Admin Parent Operations workspace.
- Static assertions for bounded limit, versioned cursor, four paginated endpoints, same-scope anchor validation, stable ordering, `limit + 1`, recipient-ID omission, UI Load more, deduplicated append, four schema indexes, migration ordering and root/docs gap-register parity.
- Dependency-free pagination helper smoke checks for default/boundary limits, cursor round-trip, malformed cursor rejection, hasMore and terminal page.

## Required runtime checks (not run)

1. Run `pnpm --filter @school-saas/api exec prisma validate` and `prisma generate`.
2. Apply migrations from P00 through P35 to clean PostgreSQL and an upgraded P34 snapshot; verify rollback/reapply procedure.
3. Run list API tests as a non-owner role with RLS enabled for all four endpoints.
4. Verify first page, next page, same-timestamp tie-break, invalid cursor, foreign-school cursor, other-student cursor, stale/deleted cursor and invalid limit.
5. Insert concurrent records between pages and document current non-snapshot semantics.
6. Verify notification JSON never contains `recipientUserId`, email or phone.
7. Run Playwright for load more, filter change, refresh, retry and school switch.
8. Capture EXPLAIN (ANALYZE, BUFFERS) plans and k6 latency for representative large school datasets.

## Runtime status

NOT VERIFIED. The environment does not have project dependencies installed and no PostgreSQL, Redis, S3, provider or browser/device runtime was started for this phase.
