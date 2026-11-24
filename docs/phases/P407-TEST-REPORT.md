# P407 Test Report

## Focused verifier
`node scripts/verify-p407-campus-registry.mjs`: **20/20 PASS**. Verifies routes, field validation, permission guards, tenant scoping, soft archive, audit actions, registry checks on inheritance/effective endpoints, migration indexes/checks/RLS.


## Regression verifiers
| Verifier | Result |
|---|---:|
| P400 | 16/16 PASS |
| P401 | 16/16 PASS |
| P402 | 16/16 PASS |
| P403 | 15/15 PASS |
| P404 | 13/13 PASS |
| P405 | 16/16 PASS |
| P406 | 17/17 PASS |
| P407 | 20/20 PASS |
| TypeScript syntax | 250 files; 0 parse errors |

## Not run
- Full build/typecheck
- Migration execution against live PostgreSQL
- Prisma validation/client generation
- Live API requests, integration or RLS tests
- UI, mobile or E2E tests

Verifier results are source-focused; they do not imply runtime validation.

## Package preservation
The final P407 archive contains 2,938 file entries and preserves all 2,924 P406 baseline file paths (0 missing). Duplicate entries: 0. CRC/integrity check: PASS. Archive-only verification does not substitute for application tests.
