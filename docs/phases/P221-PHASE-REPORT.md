# P221 Phase Report — Applicant Correction Workflow

## Scope
Complete the applicant-side response loop for Admissions requests for information/corrections.

## Implemented
- Added public tracking-token GET endpoint for school REQUEST_INFORMATION review notes. Returned fields are limited to noteText, createdAt, and recommendation; query is tenant/school/application scoped and rate limited.
- Extended public application PATCH endpoint to permit only DRAFT and DOCUMENTS_PENDING stages. Conditional update retains organization/school/application scope, current editable stage, token revocation and expiry checks.
- PATCH response now returns the existing application stage; correction saves do not transition the application.
- Applicant portal displays school information requests and supports editing/saving application fields while DOCUMENTS_PENDING. Existing DRAFT resume/edit remains.
- Applicant status load hydrates editable fields for DRAFT and DOCUMENTS_PENDING.

## Source-level checks
- Correction endpoint accepts DOCUMENTS_PENDING and rejects other stages: checked.
- Conditional update retains tenant/school/status/token validity constraints: checked.
- Applicant-safe requests endpoint select fields restricted: checked.
- Portal correction UI and request list wired: checked.
- Root/docs gap register and resolved-history mirror equality: checked.
- ZIP integrity: checked.

## Not performed
No builds, typechecks, database migrations/runtime, tests, API integration, mobile builds, deployment or E2E checks performed (deferred by project instruction).

## Remaining admissions gaps
Notifications to applicant, reviewer re-open/follow-up state, reviewer acceptance of correction, richer document rejection/re-upload lifecycle, mobile parity and final runtime validation remain open.
