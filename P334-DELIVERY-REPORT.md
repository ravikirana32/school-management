# P334 — Admission Reviewer Personal Queue

## Cycle 1 scope delivered
- Added a dedicated authenticated API endpoint `GET /applications/my-review-queue`.
- Queue identity derives from the authenticated session user; the client cannot pass a reviewer ID to broaden the query.
- API requires active school membership, `admissions.read`, and admissions subscription entitlement through existing scope middleware.
- Returned applications are organization/school scoped, assigned to the current user, and limited to active review states (`SUBMITTED`, `UNDER_REVIEW`, `DOCUMENTS_PENDING`).
- Queue is sorted oldest-updated first and capped at 200 records; response includes reviewer ID, count, and cap metadata.
- School Admin Admissions Workspace now has a “My assigned queue” action that fetches the personal queue, sets its application IDs as the filter set, and clears other filters for the user.
- Existing all-reviewer, unassigned, status, and search filters remain preserved.

## Verification
- Targeted source contract checks: 8/8 PASS.
- API route transpile syntax: 0 diagnostics.
- Admin workspace transpile: reports one pre-existing syntax diagnostic in source also present in P332 baseline; no new parser diagnostic count was introduced (baseline and modified both 1). Full build/typecheck unavailable due dependencies not installed.
- ZIP integrity / CRC: PASS.
- Baseline deletions: 0.
- Runtime API/database, full build, browser, and E2E: not run; deferred to Cycle 2.
