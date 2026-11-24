# P222 — Applicant Correction Response Lifecycle

## Implemented in source
- `AdmissionReviewNote` now carries `responseStatus` (`OPEN`, `RESPONDED`, `RESOLVED`), applicant response text, response timestamp, and resolution timestamp.
- Public applicant tracking-token API exposes lifecycle fields for school information requests while preserving tenant/school/application scoping.
- Applicant response endpoint validates a 3–2,000 character response, permits only DRAFT/DOCUMENTS_PENDING application stages, updates only an OPEN request, and returns conflict on duplicate/stale response.
- Applicant portal supports writing and submitting responses to open requests and displays response status plus submitted response/timestamp.
- Staff resolve endpoint requires `admissions.manage`, scopes the request to the application and tenant/school, and conditionally resolves OPEN/RESPONDED requests.
- Prisma schema and migration add lifecycle fields and an index.

## Verification performed
- Static source inspection/assertions only; no build/typecheck/runtime/database migration/API test/mobile/E2E/deployment/security validation performed (deferred as requested).
- Cumulative ZIP integrity check performed.
