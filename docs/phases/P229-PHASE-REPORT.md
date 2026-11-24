# P229 — Admissions Applicant Notifications & Inbox

## Delivered (source implementation)
- Added `AdmissionApplicantNotification` persistence model and migration with tenant/school/application scope, event key deduplication, timestamps and read state.
- Added applicant-token-authenticated notifications listing and mark-read endpoints. Both resolve the active, non-revoked, unexpired tracking token and scope operations to its application.
- Added applicant-facing inbox in the Public Portal with unread count, notification title/body/time, and mark-as-read action.
- Created notification events for applicant submission, application status transitions, document verification/rejection, and school information requests.
- Notification copy is applicant-safe and excludes reviewer identity and internal review notes.
- Idempotent event-key upsert protects duplicate event creation for the same lifecycle event.

## Verification boundary
- Static source assertions and archive integrity checks only.
- No build, typecheck, migration execution, database runtime, API integration, mobile build, or E2E tests run, per project instruction to defer validation.

## Remaining gaps
- Email/SMS delivery and provider operational acceptance.
- Additional lifecycle notification events (offer/fee/seat reservation/withdrawal as applicable).
- Mobile inbox parity.
- Notification retention, pagination, and user notification preference controls.
- Final build, migration, API, security and E2E validation.
