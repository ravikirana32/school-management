# P566 Test Report

## Executed

| Suite | Result |
|---|---:|
| P566 focused source verifier | 44/44 PASS |
| P358 hostel baseline regression | 43/43 PASS |
| P562 transport GPS regression | 19/19 PASS |
| P564 transport incident regression | 25/25 PASS |
| P565 transport fees regression | 34/34 PASS |
| API route TypeScript syntax transpilation | 0 diagnostics |
| School Admin TSX syntax transpilation | 0 diagnostics |

The transpilation check used TypeScript `transpileModule`; it is a syntax/transformation check, not a dependency-backed semantic typecheck.

## Not executed
- Prisma format/validate/generate.
- PostgreSQL migration on clean/upgraded database, rollback and schema diff.
- Runtime API/database integration tests.
- Dependency-backed API and School Admin build/typecheck.
- Production-like RLS and cross-school negative authorization tests.
- Browser/device E2E and accessibility.
- Native warden mobile/offline/push verification.
- Concurrent session creation, attendance writes, night-check writes and escalation race/load tests.
- Guardian notification provider/webhook delivery.

## Regression preservation
P358 baseline regression is 43/43 PASS, confirming the original Hostel Building, Room, Bed, Allocation, Checkout, Incident, School Admin integration and permission-seed source contracts remain present.
