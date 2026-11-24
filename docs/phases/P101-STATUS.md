# P101 Status — Document and Data Governance

Status: FUNCTIONAL SOURCE SLICE IMPLEMENTED; DATABASE/API/WEB RUNTIME ACCEPTANCE DEFERRED.

## Delivered
- Added tenant-scoped data-subject request records for ACCESS, EXPORT, ERASURE and CORRECTION requests.
- Added a guarded request workflow: REQUESTED → UNDER_REVIEW → APPROVED/REJECTED. Completion is intentionally blocked until actual export/erasure/correction execution and evidence capture exist.
- Added tenant-scoped document legal holds with reason, authority reference, actor and release audit fields.
- Added school-level retention policy records with bounded retention periods.
- Added a review-only retention preview for CLEAN student, staff and homework documents; active legal holds are excluded from eligibility.
- Automatic deletion is deliberately not implemented. The preview explicitly reports `automaticDeletion: false`.
- Added append-only consent event records for parent invitation acceptance and consent withdrawal, preserving the consent version and notice snapshot.
- Added School Admin Data Governance workspace for requests, legal holds, retention policies, retention preview and consent history.
- Added RLS tenant isolation to all P101 governance tables and a positive retention-days database constraint.

## API surface
- GET/POST `/api/v1/:organizationId/:schoolId/governance/requests`
- POST `/governance/requests/:requestId/review`
- GET/POST `/governance/legal-holds`
- POST `/governance/legal-holds/:holdId/release`
- GET/POST `/governance/retention-policies`
- GET `/governance/retention-preview`
- GET `/governance/consent-events`

All routes require an active school membership and `school.settings.manage`.

## Deferred by user direction
Unit tests, API integration tests, browser E2E, mobile E2E and formal test-case creation/execution are deferred to the consolidated validation phase. No test-only work was added in P101.

## Not claimed / remaining
- Prisma validation/client generation and migration execution have not been run.
- API, database and School Admin runtime acceptance have not been run.
- Actual export generation, identity-proofing, erasure execution, deletion worker and legal retention approvals remain open.
- Consent event append-only behavior is enforced by application write paths and database access controls; privileged database-owner tampering is not cryptographically prevented.
- Retention preview currently uses record creation date and CLEAN status; jurisdiction-specific schedules and record-specific legal bases require approval.
- No automatic deletion occurs; legal hold precedence is applied in the preview only.
