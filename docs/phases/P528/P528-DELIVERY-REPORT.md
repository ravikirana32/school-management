# P528 — Application Status Transitions & Audit

## Delivered
- Added tenant/school-scoped `GET /:organizationId/:schoolId/admissions/applications/:applicationId/transition-options` preflight endpoint.
- Endpoint returns application identity/current status/update timestamp, allowed transitions from the shared transition map, terminal-state flag, and up to 10 recent stage-history rows.
- Missing application response is tagged `ADMISSION_APPLICATION_NOT_FOUND`.
- Transition rejection errors now carry stable codes and context for invalid transitions, missing reviewer decisions, unconfigured eligibility rules, missing verified documents, DOB and age violations. Existing HTTP status and message behavior remains.
- Existing compare-and-update concurrency guard, stage-history write, applicant notifications, and staff notifications are retained.
- Mutation route remains permission-gated by `admissions.manage`; metadata route is `admissions.read`.

## Focused verification
- P528 verifier: 21/21 PASS.
- P527 intake verifier: 20/20 PASS.
- P526 foundation verifier: 18/18 PASS.
- P525 fixture verifier: 14/14 PASS.
- P524 lifecycle verifier: 13/13 PASS.
- P523 date-window/drilldown verifier: 16/16 PASS.
- P522 ledger verifier: 19/19 PASS.
- P521 server aggregation verifier: 33/33 PASS.
- P520 consolidation verifier: 24/24 PASS.
- Combined selected assertions: **178/178 PASS**.

These are source-level focused checks only; they do not replace runtime integration, build/typecheck, browser/mobile or full E2E acceptance.
