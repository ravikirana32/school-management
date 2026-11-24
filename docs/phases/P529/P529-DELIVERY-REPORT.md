# P529 Delivery Report — Admissions Document Checklist & Rule Resolution

## Implemented
- Added `GET /:organizationId/:schoolId/admissions/applications/:applicationId/checklist` for school-scoped checklist resolution.
- Requires active membership, admissions read permission, and admissions entitlement via existing `scope` helper.
- Matches enabled eligibility rule by board first; falls back to `ANY`.
- Required documents come from the matched rule.
- Required checklist states: `VERIFIED` (only when status VERIFIED and security CLEAN), `SCANNING`, `REJECTED`, `REVIEW_PENDING`, `MISSING`.
- Optional documents uploaded to the application are surfaced separately.
- Returns rule context, required/verified/missing/rejected/scanning/review-pending counts and `readyForSubmission`.
- Does not expose storage object keys. Existing upload, scan, review and submission gates are preserved.

## Verification
- P529 focused verifier: 22/22 PASS (source assertions).
- P528 focused regression: PASS (21/21 source assertions).
- Runtime/database, build/typecheck, browser, mobile and full E2E remain unverified.
