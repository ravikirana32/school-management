# P281 Status — Notifications

Implemented recipient fan-out and a recipient-scoped in-app inbox/read lifecycle for published P280 communications.

## Delivered
- Publishing a communication resolves audience recipients within the selected school.
- ALL audience resolves active school non-parent role assignments plus active staff and consented parent recipients.
- PARENTS audience targets active linked guardians with communications enabled and accepted, non-withdrawn consent matching the linked user; email verification is required.
- STUDENTS audience includes directly linked student accounts when available and uses consented parent/guardian proxy for students without direct account links.
- TEACHERS and STAFF audiences target active staff profiles with linked user accounts.
- NotificationPreference IN_APP GENERAL opt-outs are honored.
- NotificationBatch and NotificationOutbox rows are created for the in-app channel with recipient count and delivered timestamps.
- ParentNotification inbox records are created for parent/guardian recipients.
- Generic recipient-scoped inbox list, mark-one-read and mark-all-read APIs added.
- Publishing audit metadata includes recipient count and batch ID.

## Preservation
- Existing P280 Communication Center draft/publish UI and API retained.
- Existing parent notification, report-card, admissions and notification delivery systems retained.

## Verification
- TypeScript/TSX syntax transpilation passed for modified routes, UI and navigation.
- Static assertions added for audience fan-out, consent/opt-out logic, outbox, inbox and read APIs.
- ZIP integrity and checksum verified.
- Full database/runtime/browser/mobile tests not run because dependencies unavailable.

## Open gaps
- P281-VAL01: Verify recipient selection and notification transaction in database fixtures; run API and web/mobile E2E.
- P281-G001: In-app inbox UI for staff/teacher and parent/student apps, unread badge and read-state UI integration.
- P281-G002: Email/push delivery, retry/operational worker lifecycle and provider receipts for communication announcements.
- P281-G003: Direct student account linking and targeting added in P284; runtime validation remains open.
