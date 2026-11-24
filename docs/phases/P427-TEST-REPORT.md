# P427 Test Report

| Check | Result |
|---|---|
| Focused source verifier | 18/18 PASS |
| Worker TS syntax transpile | 0 diagnostics |
| Scheduler 15-minute cadence source check | PASS |
| Tenant/school task scope source check | PASS |
| Completed task exclusion | PASS |
| Due-soon window (24h) | PASS |
| Daily school-timezone dedupe | PASS |
| Duplicate insert protection | PASS |
| Worker logging and graceful shutdown source checks | PASS |
| Production Compose service source check | pending verifier |
| Live DB, RLS, runtime, full typecheck/build, E2E | NOT RUN |

Static source checks are not runtime evidence.
- Production worker Compose wiring verifier: PASS
- Migration dependency wiring verifier: PASS
