# P199 — Admissions Notification Inbox Baseline

## Delivered
- Added `readAt` to NotificationOutbox and a migration/index supporting school/recipient/read-state retrieval.
- Added school-scoped, recipient-scoped admissions inbox GET endpoint (admissions.read), bounded to 100 records.
- Added idempotent mark-one-read endpoint with organization, school, recipient, channel and category checks.
- Added School Admin Admissions inbox UI showing title/body, creation time, read/unread state, and mark-read action.
- Updated root and mirrored master gap registers.

## Remaining
- Mobile inbox parity, pagination, bulk read, application deep links, email/SMS provider integration and delivery failure/retry UI.
- Build, typecheck, tests, security-negative and runtime acceptance are deferred.

## Archive
Cumulative P199 archive created from P198 source baseline.
