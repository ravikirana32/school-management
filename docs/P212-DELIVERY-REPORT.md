# P212 Delivery Report — Public Draft Editing API

Baseline: P211 cumulative archive.

## Delivered
- Added a public tracking-token-authenticated `PATCH /public/:organizationId/:schoolId/admissions/applications/:trackingToken/draft` endpoint for applicant draft edits.
- Validates update payload against the existing application schema using partial validation.
- Draft-only edits; non-DRAFT application returns 409.
- Resolves token within organization/school scope and rejects expired/revoked/unknown tokens.
- Uses a conditional update scoped to DRAFT to avoid stale/concurrent edits overwriting a lifecycle transition.
- Date-of-birth input is converted to the persisted Date representation.
- Added static source verification.

## Verification
- Source verification script: `node scripts/verify-p212-admissions-public-draft-update.mjs`.
- Build, typecheck, API runtime, migration, integration, browser/mobile and E2E tests remain deferred.

## Remaining scope
This phase provides the API foundation only; the public portal still needs to expose draft edit/resume UX, and complete admissions functionality remains open.
