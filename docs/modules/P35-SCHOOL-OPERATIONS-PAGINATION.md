# P35 — School Operations Pagination & Privacy

## Scope

P35 replaces the fixed 100-row School Admin list cap for fee charges, homework assignments, report cards and parent notifications with bounded keyset pagination. It does not change parent-facing portal pagination.

## Contract

Each operator list accepts:

- `limit`: integer 1–100; default 30.
- `cursor`: optional opaque base64url cursor containing a versioned record ID.
- `studentId`: optional filter for fees, homework and report cards.

Responses use `{ data: { items, nextCursor, hasMore } }`. The notifications response additionally declares `recipientIdentityIncluded: false`.

Ordering is deterministic: `createdAt DESC, id DESC`. The API fetches `limit + 1`, returns at most `limit`, and emits a cursor from the last returned row only when another row exists.

## Security

Every endpoint retains its existing authenticated school membership and granular permission check. A supplied cursor is resolved inside the same organization, school and active student filter before use. Invalid, stale, foreign-school or cross-student cursors return HTTP 400. The cursor is a navigation token, not an authorization credential. Tenant predicates remain in the actual list query and PostgreSQL RLS remains defense in depth.

The notification list never serializes `recipientUserId` or email/phone details. It returns operational notification content and read state only. It currently returns one row per recipient and does not yet aggregate recipients into a batch summary.

## Performance

P35 adds composite indexes over `(organizationId, schoolId, createdAt, id)` for the four list tables. Existing student-specific indexes remain. Index query plans and production-scale latency have not been measured.

## UI

The School Admin Parent Operations workspace requests the first 30 records and exposes a Load more action. It appends unique IDs, preserves the current student filter, and refresh resets the list/cursor.

## Deliberate deferrals

- No payment gateway is selected. The current fee payment flow is manual reconciliation only. A provider-neutral contract and provider decision must precede checkout/webhook implementation.
- Homework submissions, attachments, grading/rubrics and teacher feedback remain open.
- Board-specific report-card schema versioning, approvals and private PDF generation remain open.
- Notification delivery preferences, push/email providers, receipts, outbox and recipient batch aggregates remain open.
