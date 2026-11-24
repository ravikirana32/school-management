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

# P178 — Public Admissions Portal UI (source-only)
- Extended the existing tenant-branded public portal with enquiry, application-draft and tracking views.
- Integrated UI forms with P177 public APIs.
- Added organization/school ID inputs because the existing public tenant context endpoint currently resolves organization branding but does not provide a school identifier to the portal.
- Added application token display and copy action; tracking status display is limited to the public API response.
- Document upload and public eligibility/submit workflow are still open.
- Attempted portal typecheck; it could not complete because React and its type packages are not installed in this extracted workspace. No build/runtime pass claimed.

# P179 — Token-authorized applicant document workflow (source-only)
- Applicant tracking-token document list/checklist endpoint added.
- Public upload authorization limited to configured checklist codes.
- PDF/JPEG/PNG, maximum 25 MB; presigned private storage upload and object metadata verification.
- Completed uploads are quarantined and queued for scanning; staff notes are not exposed publicly.
- Public portal checklist and upload controls added.
- Final application submission, eligibility enforcement at public submit, school context resolution, distributed abuse defenses, contact verification/token lifecycle, and runtime acceptance remain open.
- Typecheck/build not confirmed because dependencies are absent.

# P180 — Public application submission and eligibility enforcement (source-only)
- Added tracking-token-authenticated public application submission endpoint.
- Only DRAFT/DOCUMENTS_PENDING may submit.
- Configured required documents must be VERIFIED and CLEAN; configured age limits and cutoff are enforced.
- SUBMITTED status and stage history are recorded.
- Public portal exposes submit action.
- Missing eligibility-rule behavior, school context mapping, contact verification, CAPTCHA, distributed rate limit, token lifecycle, notifications, and runtime acceptance remain open.
- Build/typecheck remains blocked by absent dependencies; no runtime acceptance claimed.

# P181 — Tenant-to-school context resolution (source-only)
- Tenant public context endpoint now returns active schools scoped to the resolved organization, using minimal fields.
- Public portal derives organization context and renders a school selector automatically; manual school ID fallback remains for unresolved context.
- Runtime/build acceptance remains open.
