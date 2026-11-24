# P272 Delivery Report — Homework & Assignments

## Scope and audit
The P271 cumulative baseline was audited before changes. Homework is already backed by Prisma models and tenant-scoped routes for assignment draft creation/list/publish, parent text submissions and resubmissions, secure private attachment handling, teacher submission listing, grading, grade history/reopen, and guardian consent checks. Existing mobile/guardian integrations were retained.

## Implemented
- School Admin homework workspace now exposes a submission review action for published assignments.
- Submission review loads status, submitted timestamp, text answer, score/max score and feedback.
- Basic grading supports score, maximum score and optional teacher feedback, with client validation and server permission/teacher assignment enforcement.
- After grading, submission rows refresh from the API.
- Homework authoring is explicitly draft-only in this UI because the audited publishing route requires approval status APPROVED and the current creation flow does not provide that approval workflow.

## Open gaps
- P272-G001: Class/section/subject-wide targeting and bulk distribution.
- P272-G002: Homework draft approval/submission-for-approval workflow.
- P272-G003: Runtime/build/typecheck/API/browser/mobile/E2E validation (deferred).

## Verification
- Source-level assertions for the review action, submission endpoint, grade endpoint, score guard, feedback input, draft-only wording and tracker mirrors: PASS: source assertions and mirror checks completed.
- ZIP integrity and checksum recorded in archive verification report.
- Typecheck/build/runtime/API/browser/mobile tests were not run.
- Gaps closed: 0.

## Next
P273 — Exams & Assessment.
