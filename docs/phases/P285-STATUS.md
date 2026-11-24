# P285 Status — Messaging

Implemented a basic parent-to-school message thread lifecycle in the cumulative P284 baseline.

## Delivered
- SchoolMessageThread and SchoolMessage models with tenant RLS and composite thread foreign key.
- Parent-owned thread listing, creation, reply and close APIs gated by active parent portal consent/access.
- Staff shared school message queue, reply and close APIs gated by school communications permissions.
- Thread status OPEN/CLOSED, categories, subject, chronological messages and last-message timestamps.
- Audit events for thread creation, parent reply, staff reply and parent/staff close.
- In-app notification fan-out to active school staff when parent starts/replies.
- Staff replies create parent inbox notification/outbox only when current consented, verified guardian linkage is valid.
- GENERAL IN_APP notification preferences respected for message notifications.
- Parent Mobile UI for creating threads, reading history, replying and closing threads.
- School Admin Parent Messaging workspace for school staff review/reply/closure.

## Preservation
- Existing communication announcements, notifications and parent portal workflows retained.
- Parent and staff access paths are separated; parents can only access threads they created.
- Closed threads cannot accept replies.

## Verification
- TS/TSX syntax transpilation passed for API routes, parent app and admin component/navigation.
- Static assertions added for thread model, route authorization, lifecycle, notification fan-out and UI integration.
- ZIP integrity and checksum verified.
- Full Prisma validation/migration, API/database runtime and mobile/web E2E not run because dependencies unavailable.

## Open gaps
- P285-VAL01: Full runtime verification for parent/staff authorization, consent withdrawal, notifications, replies and closure.
- P285-G001: Thread assignment/ownership, SLA, escalation and reopen workflow.
- P285-G002: Message attachment upload/scan lifecycle and file permissions.
- P285-G003: Message delivery/read receipts, notification deep links and teacher mobile messaging UI.
- P285-G004: Duplicate-submit idempotency and robust unread-thread counters.
