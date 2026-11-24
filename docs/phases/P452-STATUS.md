# P452 — In-App Notification Inbox Pagination & Grouping

## Status
Implemented at source level using existing `NotificationOutbox` IN_APP records. This extends the P281 inbox rather than creating duplicate notification storage.

## Delivered
- Cursor pagination using descending `(createdAt, id)` ordering, with validated base64url cursors.
- Page size defaults to 50 and is bounded from 1 to 100.
- Recipient, organization, school, and channel scoping retained in inbox reads.
- Unread count returned with each inbox page and a dedicated unread-count endpoint.
- Optional category grouping via `grouped=true`.
- Inbox payload projection limits returned fields to notification display/status metadata.
- Added helper unit tests and `verify:p452` package script.
## Verification
- P452 source verifier: 10/10 PASS.
- Node syntax check of verifier script: PASS.
- Focused Vitest execution: NOT VERIFIED; command timed out while invoking `npx` and dependencies are not confirmed installed.
- Full TypeScript build/typecheck, live DB/API, concurrency, browser/mobile E2E: NOT RUN.
## Known limitations
- Grouping is category-based and only groups the current page.
- Inbox uses the existing outbox table; no separate notification inbox table or retention worker added.
- Runtime authorization/database behavior is not live-validated in this environment.
## Release
P452 cumulative archive carries the P451 baseline and overlays P452 implementation, reports, register updates, verifier, and checksum/verification documentation.
