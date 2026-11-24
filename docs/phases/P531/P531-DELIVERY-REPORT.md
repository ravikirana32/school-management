# P531 Delivery Report

## Objective
Harden admissions document review, decision-state consistency, and rejected-document correction handling.

## Source changes
- Added `backend/api/src/modules/admissions/admission-document-review-policy.ts` to centralize allowed review state, clean-scan prerequisite, and mandatory rejection-note validation.
- Updated `backend/api/src/modules/admissions/admission.routes.ts` to validate review inputs with the shared policy, perform guarded compare-and-set updates, return a stable concurrent-review conflict, and tenant/application scope the post-update reload.
- Updated `apps/school-admin/src/AdmissionsWorkspace.tsx` so rejection is disabled until a correction reason is entered and the note field provides explicit correction guidance.
- Added `scripts/verify-p531-admission-document-review.mjs`.

## Evidence
- Focused P531 verifier: 15/15 PASS.
- Regression: P530 25/25; P529 22/22; P528 21/21; P527 20/20; P526 18/18; total 106/106 PASS.
- Combined source assertions: 121/121 PASS.

## Remaining limitations
No full builds, typechecks, PostgreSQL fixture/runtime integration, tenant-negative API execution, storage-provider testing, browser accessibility, mobile, or E2E acceptance is claimed. These remain tracked in the master gap register.
