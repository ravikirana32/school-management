# P126 — Fee refund and reversal lifecycle

## Scope

P126 introduces a school-scoped refund request, independent approval, and manually evidenced settlement lifecycle for existing `StudentFeePayment` records. It does not initiate a bank, card, UPI, or payment-provider transfer and does not implement a general-ledger journal.

## Permissions

- `fees.refunds.request`: create refund requests. Seeded to `SCHOOL_FINANCE`.
- `fees.refunds.approve`: approve or reject pending requests. Seeded to `SCHOOL_PRINCIPAL`; `SCHOOL_ADMIN` receives the complete permission catalogue.
- `fees.refunds.settle`: record external settlement evidence. Seeded to `SCHOOL_PRINCIPAL`; `SCHOOL_ADMIN` receives the complete permission catalogue.
- `fees.payments.read`: view refund history, in addition to payment details.

The requester cannot approve their own request. Finance Officers cannot approve or settle their own requests under the seeded role.

## API routes

All routes are authenticated and scoped to `/:organizationId/:schoolId/parents`.

- `POST /fees/payments/:paymentId/refunds` — request a refund; requires `Idempotency-Key` and a reason.
- `GET /fees/payments/:paymentId/refunds` — read refund lifecycle and append-only events.
- `POST /fees/refunds/:refundId/approve` — approve a pending request with a note.
- `POST /fees/refunds/:refundId/reject` — reject a pending request with a reason.
- `POST /fees/refunds/:refundId/settle` — record settlement using an external settlement reference and date.

## State model

`REQUESTED` → `APPROVED_PENDING_SETTLEMENT` → `SETTLED`

`REQUESTED` → `REJECTED`

Approval does not alter the payment or fee balance. Settlement is only recorded when an operator supplies an external reference. It reduces the charge's recorded amount paid and marks the payment `PARTIALLY_REFUNDED` or `REVERSED` based on the cumulative settled refund amount.

## Financial and concurrency controls

- Refund amount must be positive and no greater than the original payment less all non-rejected reserved refunds.
- School-scoped idempotency keys prevent duplicate requests.
- Advisory transaction locks serialize idempotency-key reuse, requests for the same payment, and settlement updates for both the payment and fee charge.
- Settlement references are unique within a school.
- The requestor cannot approve their own request.
- The refund event table is append-only, enforced by a PostgreSQL trigger.
- Refund and event rows have composite tenant foreign keys and forced row-level security policies.
- Every transition writes an audit-log entry and an immutable refund event.

## Explicit limitations

- No money is transferred by these APIs.
- No payment-provider refund API or webhook reconciliation adapter is implemented.
- No credit-note document is generated.
- No balanced accounting journal or general ledger is posted.
- Manual settlement references are evidence supplied by an authorized operator and require external reconciliation controls.
- Database migration, Prisma validation, runtime API validation and concurrency testing have not been executed in this phase.
