# P328 — Teacher Homework Submission Review

## Scope
Cycle 1 teacher-side homework submission review usability. Existing authorized teacher submission access and grading API are retained; this phase adds review-status filtering and counts in Teacher mobile.

## Delivered
- Filter submission list by All, Submitted, Resubmitted, and Graded.
- Display counts for each review state, based on the loaded submissions.
- Keep answer text, scan-cleared attachment handling, score/feedback inputs, and existing grade action in the review card.
- Empty-state message when the chosen filter has no matching submissions.

## Verification
- Static verifier: 10/10 PASS (`scripts/verify-p328-teacher-homework-submission-review.mjs`).
- Teacher mobile TSX transpilation: 0 diagnostics.
- Runtime, API/database integration, device tests, and full build: NOT RUN.

## Limitations / open gaps
- Counts cover the current API-loaded submission page (existing endpoint limit), not necessarily all submissions beyond that page.
- Student names are not included in this review API response; UI continues to use student ID.
- Late classification, bulk review, rubric review UI, and runtime verification remain open.
