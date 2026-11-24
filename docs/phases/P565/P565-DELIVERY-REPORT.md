# P565 Delivery Report — Transport Fees, Ledger, Analytics, Mobile & Tests

## Delivered
- School-scoped transport fee plans with monthly/term/annual billing cycle, amount, currency, optional route scope and academic year.
- Idempotent monthly invoice generation for active student transport allocations. The invoice captures allocation, plan, billing period, gross amount, discounts, waivers, net amount, due amount, due date and issuer. Duplicate allocation-period invoices are skipped safely.
- Payment recording for cash, UPI, bank transfer, cheque, card and other offline/manual methods; unique school payment references and generated receipt numbers. This records a payment; it does not claim gateway settlement.
- Outstanding balance, paid amount, invoice totals and payment/adjustment detail in a tenant-scoped transport ledger.
- Audited discount/waiver adjustment records with reason and actor.
- Overpayment prevention, balance compare-and-update concurrency guard and immutable payment records.
- Parent fee visibility for only linked students whose guardian has accepted portal consent and communication permission.
- School Admin plan creation, invoice generation, ledger review, adjustment and payment controls; Parent Mobile transport fee totals, invoices and receipt references.
- Prisma models and SQL migration for plans, invoices, payments and adjustments.

## API
- GET/POST `/:organizationId/:schoolId/transport/fees/plans`
- POST `/:organizationId/:schoolId/transport/fees/invoices/generate`
- GET `/:organizationId/:schoolId/transport/fees/ledger`
- POST `/:organizationId/:schoolId/transport/fees/invoices/:invoiceId/adjust`
- POST `/:organizationId/:schoolId/transport/fees/invoices/:invoiceId/payments`
- GET `/:organizationId/:schoolId/parents/portal/transport-fees`

Management mutations require `transport.manage`; parent read endpoint reuses parent portal consent and guardian communication filters. All queries are organization/school scoped.

## Financial behavior and limitations
- Invoice generation uses a matching active route-specific plan when present, otherwise the active general plan, otherwise the allocation's existing monthlyFee. Zero-value allocations are skipped.
- The current adjustment endpoint records one cumulative discount/waiver state per invoice and stores each adjustment reason/actor as an audit row.
- Payments are manually recorded with a unique reference and receipt number. Online payment gateway, webhook settlement and refund lifecycle are not connected in this phase.
- Billing period format is `YYYY-MM`; invoice generation is currently allocation/period based. The fee plan stores term/annual cycle metadata, while automated term/annual period scheduling remains open.
- Parent Mobile displays fee totals, invoice status and payment receipt references; it does not collect payments.

## Verification
- P565 focused verifier: 34/34 PASS.
- P564 incident/maintenance regression: 25/25 PASS.
- P562 GPS regression: 19/19 PASS.
- P561 attendance regression: 16/16 PASS.
- P560 capacity regression: 17/17 PASS.
- P559 personnel regression: 24/24 PASS.
- Transport API, Parent API, School Admin TSX and Parent Mobile TSX transpilation: 0 diagnostics.
- Aggregate focused assertions: 135/135 PASS.
- Not run: Prisma CLI validation/generation, live DB migration, dependency-backed full build/typecheck, runtime DB/API tests, gateway/webhook integration, device/browser interaction, accessibility, load/concurrency and full E2E. The payment compare-and-update guard is source-verified, not load-tested.

## Known open gaps
- Online gateway checkout, webhook verification, idempotent gateway event ingestion and automated settlement.
- Payment refunds, chargebacks, receipt PDF/print template and accounting journal integration.
- Scheduled monthly/term/annual invoice generation and configurable proration for mid-period route changes.
- Fine-grained installment schedules, late-fee policy integration, taxes and configurable concessions/approval workflow.
- CSV exports, period-wise analytics and bank/payment reconciliation.
- Parent payment initiation and payment provider UX.
- Full Prisma/database/runtime/build/security/accessibility/concurrency/E2E acceptance.

## Cumulative release
Built from verified P564 cumulative baseline. Archive manifest, SHA-256 checksum and archive verification report are included in the cumulative ZIP.
