# P531 Status — Admission Document Review & Decision Hardening

**Status:** Source implementation complete; runtime acceptance remains open.

## Delivered
- Review eligibility restricted to documents in `RECEIVED` state and `CLEAN` scan state.
- Rejection requires a non-empty correction reason.
- Review write changed to compare-and-set update guard on current status and clean scan state.
- Concurrent/stale reviews return stable conflict code `ADMISSION_DOCUMENT_REVIEW_CONFLICT`.
- Tenant/school/application-scoped reload before applicant notification.
- School Admin reject action disabled until correction note is provided.
- Existing applicant notifications, rejected same-type replacement, document timeline/version history retained.

## Verification
- P531 focused source assertions: 15/15 PASS.
- P526–P530 regression focused assertions: 106/106 PASS (P530 25, P529 22, P528 21, P527 20, P526 18).
- Combined assertions: 121/121 PASS.
- These are source assertions, not build/runtime/DB/browser/mobile/E2E results.
