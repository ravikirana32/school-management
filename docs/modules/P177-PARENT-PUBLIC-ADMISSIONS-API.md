# P177 — Parent/Public Admissions API Foundation

## Delivered (source-only)
- Added anonymous, school-scoped enquiry intake endpoint: `POST /api/v1/public/:organizationId/:schoolId/admissions/enquiries`.
- Added anonymous application draft intake endpoint: `POST /api/v1/public/:organizationId/:schoolId/admissions/applications`.
- Public application drafts receive a generated application number and a cryptographically random tracking token. Only the SHA-256 token hash is persisted.
- Added public status lookup endpoint: `GET /api/v1/public/:organizationId/:schoolId/admissions/status/:trackingToken`; it returns limited fields and uses the token as a bearer secret.
- Public routes verify that the requested school is active and tenant-owned by the organization.
- Added schema field, unique index migration, and process-local request throttle (12 requests/minute per IP/path).

## Not completed in P177
- Parent/Public web or mobile UI.
- Token-based document upload, upload completion and checklist APIs.
- Public application submission to `SUBMITTED` with eligibility/document enforcement. Drafts created here remain `DRAFT`; staff-controlled workflow still governs submission/review.
- Redis/shared limiter, CAPTCHA/anti-bot, gateway protection, email/SMS verification, token rotation/revocation, expiry, and abuse monitoring.
- Builds, migrations, API/runtime and security acceptance are deferred by instruction.

## Verification
Source and archive inspection only. ZIP integrity checked. No build/runtime acceptance claimed.
