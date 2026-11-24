# P369 Test Report

| Check | Result |
|---|---:|
| P368 auth/security static audit | 16/16 PASS |
| P368 auth/security contract | 6/6 PASS |
| P369 RBAC/scope audit | 14/14 PASS |
| P369 RBAC audit contract | 6/6 PASS |
| C2-01 dependency-free CI source gate | 16/16 PASS |
| TS/TSX syntax scan | 246 scanned; 0 parse errors |
| Domain invariant tests | 20/20 PASS |
| Documentation/register mirror parity | 6/6 PASS |
| Full static verifier suite | 155/156 PASS (1 blocker) |

**Known blocker:** `pnpm-lock.yaml` is absent, so workspace audit reports the lockfile blocker. Network access/bootstrap was unavailable in the earlier C2-01 attempt. No dependency installation, full typecheck/build, API runtime, mobile runtime, database, Redis, or E2E acceptance is claimed.

## C2-03 limitation
Static source checks and marker inventory are heuristic and are not proof of route protection. Route-by-route authorization negative tests and cross-tenant IDOR tests remain open.
