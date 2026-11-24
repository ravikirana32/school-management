# P568 Feature Contract — Hostel Leave & Guardian Communication

## Roles and authorization
- Parent portal read requires `parent.hostel.read`.
- Parent leave create/edit/cancel and consent changes require `parent.hostel.manage`, active school/organization membership, accepted parent invitation/consent, verified guardian identity and a linked student with `canReceiveCommunications`.
- Warden/School Admin read requires `hostel.read`; mutations require `hostel.manage` or School Admin access.
- Tenant/school IDs are included in database filters. P568 adds composite tenant integrity for guardian consent and notification-event-to-leave linkage.

## Leave lifecycle
`PENDING -> APPROVED -> RETURNED | RETURNED_LATE`
`PENDING -> DENIED | CANCELLED`
`APPROVED -> CANCELLED` only before resident departure
`APPROVED -> LATE_RETURN` when expected return elapsed and resident pass remains `CHECKED_OUT`.

A request requires an active hostel allocation. Departure must be in the future and expected return later. Overlapping `PENDING`, `APPROVED` and `LATE_RETURN` requests for the same student are rejected. Warden approval revalidates the active allocation, rejects existing leave-linked passes and active resident passes, and creates one P567 resident outpass. Per-student and per-leave PostgreSQL advisory locks serialize conflicting writes.

## Gate-pass integration
- Pass validity equals approved leave departure/expected-return window.
- Departure remains recorded by P567 gate-pass `depart` action.
- Return check-in requires the linked resident pass to be `CHECKED_OUT`, marks the pass `RETURNED`, and records actual return. The legacy P567 gate-pass return route also synchronizes the linked leave request.
- P567 visitor and resident gate-pass workflows remain intact.

## Guardian notification consent
- Consent is explicit per student and guardian, versioned as `hostel-leave-v1`, and independently controls leave updates, in-app and email.
- Default consent and channels are off.
- Only accepted/verified linked guardians with `canReceiveCommunications` and explicit consent are recipients.
- `NotificationPreference` opt-outs override channel delivery.
- In-app notifications are stored in the parent portal notification feed.
- Email enters the existing `NotificationOutbox`; provider send, retry, suppression and webhook outcomes are tracked. Queueing is not provider delivery.
- SMS and push are not enabled by P568.

## Late return
- Worker detects overdue requests only when the resident gate-pass remains checked out.
- Conditional status update prevents duplicate late-return events.
- Warden return check-in records on-time or late return and closes the pass.

## Privacy and safeguarding
- Guardian notifications omit destination and contact number.
- Destination/contact fields are visible only in authorized School Admin/warden workspace.
- Consent revocation prevents future email worker delivery; previously delivered in-app records are not retroactively deleted.
- Independent legal/safeguarding review and retention policy remain open.
