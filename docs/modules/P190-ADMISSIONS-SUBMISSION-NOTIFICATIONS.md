# P190 — Admissions Submission Notifications (Source Remediation)

## Scope
Notify active school staff who have the `admissions.manage` permission when a public applicant submits an application. This phase uses the existing `NotificationBatch`/`NotificationOutbox` data model and records in-app notification entries. Draft creation is intentionally not notified; the trigger is the final public submission transition.

## Source changes
- Added a scoped recipient resolver: role assignments must be for the same organization and school and include `admissions.manage`; recipients must have an ACTIVE school membership and an active user account.
- Public applicant submission now creates a deterministic batch key based on the application ID and deduplicated in-app outbox entries for the resolved staff recipients.
- Notification payload includes a title, application number, application ID and child first name only; no guardian contact, document contents, tracking token, or private notes.
- Outbox creation is best-effort and does not fail an otherwise successful application submission.
- Notification generation is idempotent at recipient/channel level using the existing unique batch-recipient-channel constraint and `createMany(skipDuplicates)`.

## Known limitations / gaps
- The existing Parent inbox is permission/consent scoped and is not a staff admissions inbox; these outbox rows are not yet surfaced in a dedicated admissions staff notification UI/API.
- Email/SMS templates and provider dispatch for admissions-specific events are not yet connected.
- If notification creation fails, no durable retry/reconciliation event is currently guaranteed for this admissions event.
- API build, unit tests, integration tests and runtime acceptance are deferred per project instruction.

**Status:** Source changed; implementation not build- or runtime-verified.
