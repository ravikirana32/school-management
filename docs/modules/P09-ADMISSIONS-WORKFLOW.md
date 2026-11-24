# P09 — Admissions and enrolment workflow

## Delivered source foundation
- Enquiry capture and school-scoped listing.
- Application draft creation, listing, stage history and controlled transitions.
- Application document metadata registration with private object-key validation; binary upload is not implemented.
- Grade/section capacity configuration. Capacity reservation and concurrency-safe seat allocation are not yet implemented.
- Offer creation and acceptance/decline with expiry checks.
- Accepted application conversion creates Student, Guardian, StudentGuardian and StudentEnrollment in one tenant-scoped transaction.
- Admission fee handoff table is a future integration ledger only; no fee collection or payment gateway is connected.

## Workflow
DRAFT → SUBMITTED → UNDER_REVIEW / DOCUMENTS_PENDING → APPROVED → OFFERED → ACCEPTED → CONVERTED. Rejected and withdrawn applications are terminal. A stage history row is written for transitions.

## Important limitations
All endpoints currently require School Admin. The admission UI is a local preview only. Parent self-service applications, staff-specific permissions, document review endpoints, capacity enforcement, notifications, payment collection, and operational dashboards remain open.
