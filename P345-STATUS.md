# P345 — Admissions Notification Completion

**Status:** Cycle 1 source implementation completed; runtime/provider verification remains open.

## Baseline audit
- Applicant-facing in-app notification records already covered status changes, document review, information requests, and other existing admission events.
- Staff in-app notification delivery existed for applicant submission, but reviewer assignment and staff-visible status transition coverage was missing.
- The notification outbox/batch schema, school-scoped notification inbox, read endpoint, and provider readiness infrastructure were reused; no duplicate notification model or migration was added.

## Delivered
- Added a reusable transaction-scoped admissions staff notification helper.
- Staff recipients are filtered to users with `admissions.manage` permission, active school membership, and active user status.
- Notification batch/outbox entries are tenant- and school-scoped, IN_APP, marked delivered to the in-app channel, and duplicate delivery is suppressed with `skipDuplicates`.
- Reviewer assignment changes now notify admissions staff.
- Admission application status transitions now notify admissions staff with old/new statuses and application number.
- Existing applicant notifications are retained.

## Verification
- P345 static verifier: 12/12 PASS.
- Runtime API/DB, full typecheck/build, browser, mobile, actual email/push provider and E2E validation: NOT RUN; deferred to Cycle 2.

## Remaining gaps
- Email/push provider lifecycle and live delivery remain open per notification baseline.
- Runtime transaction and race-condition behavior requires DB-backed validation.
- Staff event notifications are currently scoped to status transitions and reviewer assignment; other admission events need further coverage review in Cycle 2.
