# P561 Test Report

## Source-focused assertions
16/16 PASS (schema, constraints, status domain, tenant-scoped API, write permission, route/student validation, handover required, upsert, summary, mobile assigned personnel authorization, mobile roster/status UI, handover control, Admin UI, migration constraints).

## Regressions
- P559: 24/24 PASS
- P560: 17/17 PASS
- P357: 45/45 PASS

## Syntax transpilation
API transport routes, School Admin Transport TSX and Driver Mobile TSX: 0 diagnostics.

## Not run
Prisma CLI validation/generation; migration on live DB; dependency-backed typecheck/build; runtime API/DB tests; browser/device UX; offline behavior; accessibility; concurrency; E2E.
