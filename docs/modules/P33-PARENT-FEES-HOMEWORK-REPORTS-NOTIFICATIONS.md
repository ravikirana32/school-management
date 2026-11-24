# P33 — Parent fees, homework, report cards and notifications

## Parent read capabilities
- Fee charges and reconciled payment history (published statuses only).
- Published homework/assignments only.
- Published report cards only.
- School notifications addressed to the authenticated parent account.
- Notification read acknowledgement is restricted to the recipient.

## School operations
- Fee charge creation requires `fees.manage`; optional publication controls parent visibility.
- Manual payment reconciliation requires `fees.manage`, a unique reference, transaction lock and outstanding-balance check. It is not a gateway payment.
- Homework creation/publication requires `academics.manage`.
- Report card creation/publication requires `reports.manage`.
- Notification fan-out requires `parent.notifications.manage` and targets only active, verified guardians with an accepted, non-withdrawn consent record and communications-enabled student link.

## Privacy and safety
Parent read endpoints require active membership, PARENT role permission, verified guardian, accepted consent and exact student link. RLS is forced on all new tables. Draft/cancelled records are never returned to parents. Attachments are metadata only; no public object URL is returned.

## Limits
Fee charges max 100 per student response; homework max 100; report cards max 50; notifications max 100. Parent UI is read-only for fee payments, homework and report cards. No online payment initiation, assignment submission, grades editing or push delivery is claimed.
