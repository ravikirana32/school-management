# P568 Status — COMPLETE (Source Implementation)

P568 Hostel Leave, Guardian Communication & Return Check-in is implemented on the P567 cumulative baseline.

- Guardian leave request create/edit/cancel from the Parent Mobile portal.
- Warden/School Admin approval and denial with decision notes and audit records.
- Approval automatically issues one linked P567 resident gate-pass with the approved leave validity window.
- Explicit per-student guardian consent for hostel leave updates and channel-level in-app/email preferences.
- In-app notification fanout and consent-gated email outbox delivery through the existing provider worker.
- Delivery/retry/cancel/dead-letter/provider webhook status reflected in HostelLeaveNotificationEvent.
- Recurring late-return monitor marks overdue residents only when their gate-pass remains CHECKED_OUT.
- Return check-in closes the gate-pass and records RETURNED or RETURNED_LATE.
- Parent Mobile and School Admin workflows are mounted.

Verification:
- P568 focused source verifier: 72/72 PASS.
- P567 regression: 57/57 PASS.
- P566 regression: 44/44 PASS.
- P358 regression: 43/43 PASS.
- Combined focused assertions: 216/216 PASS.
- Nine changed API/worker/Admin/Parent Mobile TS/TSX files transpile with 0 diagnostics.

Not run: Prisma CLI validation/generation, live PostgreSQL migration/runtime, dependency-backed builds/typechecks, production-role RLS/cross-school negative tests, real provider delivery/webhook E2E, browser/device, accessibility, concurrency/load and full E2E. SMS/push and dedicated warden mobile workflows remain OPEN.
