# P567 Test Report

## Executed

| Suite | Result |
|---|---:|
| P567 focused source verifier | 57/57 PASS |
| P566 hostel attendance regression | 44/44 PASS |
| P358 hostel foundation regression | 43/43 PASS |
| Hostel API route TypeScript syntax transpilation | 0 diagnostics |
| School Admin Hostel Workspace TSX syntax transpilation | 0 diagnostics |

The transpilation check uses TypeScript `transpileModule`; it is a syntax/transformation check, not a dependency-backed semantic typecheck.

## Not executed
- Prisma format/validate/generate.
- PostgreSQL migration on clean and upgraded databases, rollback/recovery and schema diff.
- Runtime API/database integration.
- Dependency-backed API and School Admin builds/typechecks.
- Production-role RLS and cross-school authorization-negative tests.
- Browser/device E2E and accessibility.
- Concurrent visitor approvals, duplicate pass race, gate event concurrency and load tests.
- Gate-staff-specific role tests, guardian notification delivery and native mobile workflows.

Static source assertions and transpilation do not establish runtime correctness. All items above remain open.
