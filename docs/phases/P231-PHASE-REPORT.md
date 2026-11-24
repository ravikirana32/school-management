# P231 — Student Profile Completeness

## Implemented
- Added school/tenant-scoped `GET /students/:studentId/profile-completeness` endpoint.
- Requires active school membership, `students.read`, and `students.pii.read`; teacher access continues through existing assigned-student scope guard.
- Computes 14 profile checks covering student identity/contact/address, primary and emergency guardian, birth certificate, student photo and active enrollment.
- Returns completion percentage, completed/total count, check detail and missing-item labels.
- Audits profile-completeness reads without logging the underlying PII.
- Added School Admin review panel with student selector, on-demand retrieval, completion percentage and missing-item list.
- Updated the persistent checklist and mirrored root/docs files.

## Source checks
- Route source includes permission gate, tenant scope, teacher scope, missing-item calculation and audit record.
- UI source includes completeness panel and endpoint invocation.
- Enum source confirms referenced document types (`BIRTH_CERTIFICATE`, `PHOTO`) exist.
- No builds, typechecks, runtime, DB migrations, formal tests, mobile builds or E2E were executed by request.

## Open gaps
- Student completeness checklist is a starting rule set and needs school-specific configuration (mandatory/optional fields, document requirements by grade/board).
- Missing-item remediation/edit workflow is not yet embedded in the panel; it currently reports missing fields only.
- Validate API response shape and teacher/school permission boundaries during final validation.
- Student profile edit workflow, medical details and consent completeness require separate gap review.

## Checklist update
- P231 student profile completeness source implementation marked complete.
- Student lifecycle profile completeness and profile remediation customization remain open.
