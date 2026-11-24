# P464 Test Report

## Executed static checks
- P464 source verifier from root: 15/15 PASS
- P464 source verifier from `backend/api`: 15/15 PASS
- P462 source verifier: 13/13 PASS
- P463 source verifier: 11/11 PASS
- P461 source verifier: 14/14 PASS
- P460 source verifier: 12/12 PASS (run from API directory)
- P459 source verifier: 11/11 PASS (run from API directory)
- P458 source verifier: 16/16 PASS
- P457 source verifier: 11/11 PASS
- P456 source verifier: 10/10 PASS
- P455 source verifier: 8/8 PASS
- P454 source verifier: 6/6 PASS

Total executed assertions counted across these verifier runs: 142 PASS. This includes both P464 working-directory runs.

## Authored, not executed
11 Vitest/Supertest HTTP integration tests in `auth.validation.integration.test.ts`.

## Not run
Vitest runtime, API typecheck/build, DB-backed integration, web/mobile builds, browser/mobile E2E, rate-limit runtime behavior.
