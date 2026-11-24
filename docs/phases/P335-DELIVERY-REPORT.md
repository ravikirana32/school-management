# P335 — Reviewer Workload & SLA

## Scope
Cycle 1 basic functionality for reviewer workload visibility and SLA aging. Existing reviewer assignment, personal queue, assignment history, and client-side workload counts were preserved.

## Implementation
- Added school/organization-scoped `GET /admissions/reviewer-workload` endpoint behind the existing authenticated admissions permission/subscription guard.
- Server computes workload across all active review applications in the selected school, rather than only the client-loaded application page.
- Summaries include active, unassigned, overdue, status breakdown, and assignments to inactive/non-membership reviewers.
- Reviewer workload includes active count, overdue count, and oldest active case age.
- Applications are returned with reviewer display details, stage age, due timestamp, SLA threshold and overdue state for the overdue list.
- Stage age uses the most recent stage-history record matching the current status; fallback is submittedAt, updatedAt, then createdAt.
- Cycle 1 SLA defaults are explicit: SUBMITTED 24 hours; UNDER_REVIEW and DOCUMENTS_PENDING 48 hours. These are visible in the UI and can be configured in a later refinement phase.
- School Admin UI added overview cards, reviewer workload table, overdue applications table, and refresh action.

## Verification
- API route TypeScript transpilation: 0 syntax diagnostics.
- AdmissionsWorkspace TSX transpilation: 1 existing diagnostic (`',' expected`) in baseline P334 and 1 in P335; diagnostic count and code are unchanged. P335 did not introduce an additional TSX parser diagnostic.
- Targeted source contracts: 9/9 PASS.
- ZIP integrity/CRC: PASS.
- Baseline file deletions: 0.
- Full package typecheck/build, runtime API/database, browser and E2E tests: not run; deferred to Cycle 2 as previously agreed.
