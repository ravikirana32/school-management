# P515 — Fee Collection, Invoice Linking & Installment Allocation

## Collection API behavior
- Existing manual collection endpoint remains `POST /fees/:chargeId/payments` and requires `fees.payments.record`.
- The API resolves school finance configuration and rejects payment methods that are disabled. Default methods are used only when no persisted configuration exists.
- The route locks the charge with a tenant-qualified advisory lock.
- Reference uniqueness remains enforced per school and charge. A retry with the same reference, amount, method and paid date returns the existing payment; a same-reference request with different details conflicts.
- If an invoice exists, it must be issued or partially paid. Payment amount is capped by invoice net outstanding; invoice draft/void/paid states reject further collection.
- Payment records carry the optional invoice ID. Invoice `amountDue` and status, charge `amountPaid` and status are updated in the same tenant transaction as the payment and accounting posting.
- Manual reconciliation remains manual: no gateway transfer is initiated or simulated.

## Installment allocation
- The route loads schedule rows in sequence order and preflights allocation before creating payment or posting accounting entries.
- Payments allocate oldest/lowest-sequence installment first, crossing installment boundaries as needed.
- Invoice line `netAmount` and `sourceInstallmentId` are used when available, preserving concession-adjusted installment targets; otherwise gross installment amounts are used.
- Legacy charge payments that predate P515 are reconciled into installment paid balances before allocating the current payment. Historical allocations are not fabricated.
- Each current payment-to-installment slice is persisted in `FeeInstallmentPaymentAllocation`; installment paid amounts/status and schedule status are updated in the same transaction.
- Allocation rows have school/organization scoped composite foreign keys, a positive amount check, unique payment/installment pair and forced RLS.

## Finance UI
- Collection amount defaults to invoice outstanding when linked to an issued/partially-paid invoice, otherwise the charge outstanding.
- Collection is blocked in the UI while an invoice draft awaits issue or when no configured enabled payment method is available.
- Enabled payment methods are fetched from school Finance Configuration.
- Payment history shows invoice number/status and installment allocation slices; printed receipts show invoice number when linked.

## Remaining acceptance
- Local Prisma validation/generation and migration apply, runtime DB/API, concurrency, tenant/RBAC negatives, browser, mobile and E2E acceptance remain pending.
- The non-cash reference toggle is not yet honored as an optional setting; the current payment form/API requires a reference for all methods (stricter behavior).
- Real gateway integration and parent/student mobile payment presentation are deferred; no simulated gateway success exists.
