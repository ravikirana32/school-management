# P467 Test Report

## Authored coverage
24 synthetic-fixture tests for platform admin, school admin, principal, department head, teacher, front office, finance, parent, library staff, transport staff, hostel staff, canteen staff, and school-permission wildcard/exact matching.

## Executed
- P467 static source verifier: **19/19 PASS** from repository root and **19/19 PASS** from `backend/api`.
- Regression verifiers P454-P467: all executed successfully (exit code 0); individual assertion totals are captured below.
  - P454 source inventory verifier executed successfully (inventory review notice; its output does not claim route runtime enforcement).
  - P455 8/8; P456 10/10; P457 11/11; P458 16/16; P459 11/11; P460 12/12; P461 14/14; P462 13/13; P463 11/11; P464 15/15; P465 16/16; P466 15/15; P467 19/19.

## Not executed / not proven
- Vitest runtime test suite
- Real role assignments and database membership
- Production HTTP route guards
- Live tenant isolation and DB-backed scope behavior
- API build/typecheck, web/mobile builds, full E2E, penetration/security testing
