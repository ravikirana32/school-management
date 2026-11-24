# P326 Delivery Report — Parent Homework Details & Submission Progress

## Implemented
- Expanded the parent portal homework item contract to accept submission status, submitted timestamp, score/max score, teacher feedback, and attachment metadata.
- Added due-date presentation with an overdue indicator for unsubmitted/ungraded work.
- Added submitted date/time, score, teacher feedback, and attachment name/scan-state display when supplied by the existing API response.
- Added safe empty-description and no-due-date states.
- Kept the panel tied to the active linked child; no attachment download links are exposed in this view.

## Verification
- `scripts/verify-p326-parent-homework-details.mjs`: 10/10 source assertions PASS.
- Parent-mobile TSX transpile: same pre-existing baseline diagnostic as P325 at line 73 (`')' expected`); no new diagnostic introduced by this phase.
- Runtime/API/database/browser/mobile acceptance not run.

## Remaining
- Confirm API payload fields and timestamp/status semantics in a live environment.
- Runtime validation, including child switching and data refresh.
- Attachment download/view workflow remains outside this parent panel.
