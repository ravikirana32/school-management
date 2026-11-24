# P327 Delivery Report — Student Homework Submission Workflow

## Delivered
- Student mobile homework cards now provide a text-answer input and Submit/Resubmit action.
- Authenticated student submission endpoint accepts required trimmed answer text (maximum 10,000 characters).
- API verifies active linked student identity, active school, published assignment, and assignment's student ownership inside tenant scope.
- Creates `SUBMITTED`; existing ungraded submission is updated to `RESUBMITTED` and clears stale grade/feedback fields; graded submissions are locked (409).
- Student UI refreshes homework after successful submission and reports failure/success.

## Verification
- Static source verifier: 10/10 PASS (`scripts/verify-p327-student-homework-submission.mjs`).
- TypeScript transpile syntax: Student mobile TSX 0 diagnostics; student routes TS 0 diagnostics.
- Runtime API/database, browser/device, build and end-to-end tests: not run (deferred per project instruction).

## Limitations / gaps
- Text-only answer submission. Upload/attachment submission flow is not implemented in P327.
- No explicit due-date blocking; late submissions are allowed pending policy design.
- Existing mobile baseline build/runtime remains unverified.
