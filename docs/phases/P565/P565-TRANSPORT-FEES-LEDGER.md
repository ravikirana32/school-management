# P565 — Transport Fees and Ledger

## Financial workflow
1. Configure a school fee plan, optionally scoped to a route and academic year.
2. Generate `YYYY-MM` invoices for active transport allocations in the selected academic year.
3. Resolve fee amount from matching active route plan, then general active plan, then the allocation's existing monthly fee.
4. Skip zero-fee allocations and safely skip an already-generated allocation/billing-period invoice.
5. Record a manual payment with method and unique school reference; issue a receipt number and update paid/outstanding balances.
6. Record a discount/waiver adjustment with reason and actor; retain a separate adjustment audit row.
7. Review school ledger totals and consent-scoped parent fee visibility.

## Endpoints
- `GET/POST /:organizationId/:schoolId/transport/fees/plans`
- `POST /:organizationId/:schoolId/transport/fees/invoices/generate`
- `GET /:organizationId/:schoolId/transport/fees/ledger`
- `POST /:organizationId/:schoolId/transport/fees/invoices/:invoiceId/adjust`
- `POST /:organizationId/:schoolId/transport/fees/invoices/:invoiceId/payments`
- `GET /:organizationId/:schoolId/parents/portal/transport-fees`

## Important boundaries
Manual payment recording is not payment-gateway settlement. Parent UI is read-only. Term/annual billing cycle values are configurable metadata; automated term/annual scheduling is not delivered. Refunds, gateway webhooks, late fees, tax, proration, exports and full runtime acceptance remain open.
