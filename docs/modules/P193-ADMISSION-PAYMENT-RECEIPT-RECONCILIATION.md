# P193 — Admission Payment, Receipt & Reconciliation (source implementation)

## Delivered
- Finance-permission gated endpoint to record an offline/manual payment against a published admission fee ledger charge.
- Requires admissions management plus `fees.manage` permission.
- Rejects payments unless the handoff ledger charge is approved and published.
- Rejects overpayments based on charge outstanding balance.
- Records a `StudentFeePayment` entry and updates charge `amountPaid` and status (`PARTIALLY_PAID`/`PAID`) transactionally.
- Creates a school-unique receipt number and `AdmissionPaymentReceipt` record.
- Payment reference and receipt number have organization/school unique constraints; receipts are listable via school-scoped API.
- Prisma model and SQL migration added.

## API
- `GET /:organizationId/:schoolId/admissions/payment-receipts` — admissions read permission.
- `POST /:organizationId/:schoolId/admissions/fee-handoffs/:handoffId/record-payment` — admissions manage + `fees.manage`; body includes amount, paymentMethod, paymentReference, paidAt.

## Limitations / remaining gaps
- This is manual/offline payment recording, not a gateway checkout or signed webhook implementation.
- Refund initiation/approval/settlement and finance reconciliation exception workflow are not included in this phase.
- Receipt PDF/print UX and parent payment UI are not included.
- Typecheck/build, API tests, concurrency/idempotency and runtime acceptance remain deferred.
