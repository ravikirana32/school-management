# P336 — Admission Decision & Review History Completion

## Scope
Complete the Cycle 1 staff-facing admission decision audit view by combining persisted stage transitions and structured decision recommendations into a chronological audit timeline.

## Source audit
The P335 baseline already persists `AdmissionStageHistory` and `AdmissionReviewNote` (including structured recommendation, reviewer ID, note text and creation timestamp), exposes school-scoped application history and review-note endpoints, and renders stage history/review notes separately. This phase reuses those persisted records and existing API calls; it does not introduce duplicate storage or a new endpoint.

## Implemented
- Added a combined timeline helper that converts stage-history entries and structured DECISION review notes into a unified event list.
- Chronologically sorts combined events by timestamp.
- Displays event type, status transition/recommendation, event time, actor/reviewer identity (display name when reviewer directory data matches; ID fallback otherwise), and note/rationale.
- Includes an empty-state message when no stage or structured decision history exists.
- Preserves the separate review notes, reviewer assignment history, and stage history sections for continuity.

## Verification
- Baseline P335 archive integrity verified before extraction.
- Modified AdmissionsWorkspace TSX parsed/transpiled with TypeScript.
- Parser diagnostic: 1 existing diagnostic, same line-relative JSX parser diagnostic as P335 baseline (baseline line 83; modified file line 89 after added helper; identical column 2675 and message `',' expected`). No new parser diagnostics.
- Targeted source contract assertions: 8/8 pass.
- ZIP integrity/CRC: pass.
- Baseline deletions: 0.
- Runtime API/database, full typecheck/build, browser, device and E2E validation: not run; deferred to Cycle 2.

## Remaining gap
Decision-event timestamps are sourced from the existing persisted creation timestamps. No dedicated immutable decision-finalization event exists beyond structured decision notes and application stage history. This is retained as a future refinement rather than falsely represented as an immutable decision ledger.
