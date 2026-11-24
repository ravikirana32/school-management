# P173 — Admissions & Student Enrollment Completion

## Goal
Close the connected school-staff admissions path from enquiry through application, documents, review, offer response, capacity-aware enrollment and student/guardian creation, across API, School Admin Web and Staff Mobile.

## Source changes
- Added `apps/school-admin/src/AdmissionsWorkspace.tsx`, integrated into the School Admin tab navigation and permission visibility. It connects to the admissions API for enquiry/application creation, enquiry-to-application conversion, stage transitions, offers, offer response, capacity configuration/read, application history, secure document upload/list/review/download and enrollment conversion.
- Added `apps/staff-mobile/src/AdmissionsPanel.tsx` and Staff Mobile navigation entry. It connects to API for applications, stage changes, offers, accept/decline, enrollment conversion, document upload/list and CLEAN+VERIFIED downloads.
- Added enquiry conversion endpoint and application document history/list, review and offers read endpoints.
- Added secure admission document upload initialization and completion using private presigned POST, metadata verification, quarantine and scan dispatch; download only when CLEAN and VERIFIED.
- Added `securityStatus` and `scanRequestedAt` fields to `AdmissionApplicationDocument` plus migration and scanner-worker support for admission documents, scan callback, reconciliation and abandoned upload expiry.
- Enrollment conversion blocks already converted applications and atomically claims capacity for a configured grade/section before creating student, guardian relationship and enrollment.
- Updated root and mirrored master gap registers.

## API workflow
- `GET/POST /:organizationId/:schoolId/admissions/enquiries`
- `POST /enquiries/:enquiryId/convert`
- `GET/POST /applications`
- `POST /applications/:applicationId/transition`
- `GET/POST /applications/:applicationId/documents` (list and secure upload start)
- `POST /applications/:applicationId/documents/:documentId/complete`
- `POST /applications/:applicationId/documents/:documentId/review`
- `GET /applications/:applicationId/documents/:documentId/download`
- `GET /applications/:applicationId/history`
- `GET/POST /offers`, offer creation and `POST /offers/:offerId/respond`
- `GET/POST /capacities`, `GET /capacities/availability`
- `POST /applications/:applicationId/convert`

## Security and lifecycle
- Upload type allowlist: PDF, JPEG and PNG; maximum 25 MB.
- Private quarantine keys; upload completion verifies object metadata (document ID, expected size, MIME).
- Scanner queue dispatch and callback are integrated for the admission-document type.
- Documents can be verified only after scanner CLEAN status; signed download is limited to CLEAN+VERIFIED records.
- Tenant-scoped membership/permissions; scanner worker and callback RLS policies added.
- Pending upload expiry cleanup is wired into document-scan worker.

## Source checks
- TypeScript transpile syntax check on changed TS/TSX files: passed.
- UI/API builds and runtime validation: deferred as requested.

## Remaining gaps (not closed)
- Parent/prospective applicant self-service application/enquiry flow in Parent Mobile/Public Portal.
- Guardian duplicate matching, safe merge and invitation/account-link flow.
- Fee-ledger/invoice/payment handoff.
- Configurable board/grade age eligibility and required-document rules.
- Automatic admission-number allocation and offer-time seat reservations.
- Full tenant/RLS, scanner, storage, mobile and runtime acceptance.

## Completion status
Source implementation is delivered for staff web and staff mobile workflows, but P173 remains `IN_PROGRESS` pending the listed gaps and runtime evidence. No build/runtime validation is claimed.

## P173 follow-up remediation (source-only)
- Fixed Staff Mobile AdmissionsPanel missing local state declarations for offers, offer number, admission number, enrollment date, section name and per-application documents. These were referenced by render/handlers but not declared, which prevented a coherent source-level mobile workflow.
- API/UI build and runtime validation remain deferred by the project instruction. Parent applicant self-service, guardian deduplication/merge, admissions fee handoff, auto admission number, eligibility/checklist configuration, and offer-time seat reservation remain open; this follow-up does not falsely close them.
