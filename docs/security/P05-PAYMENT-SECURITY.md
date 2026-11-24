# P05 Payment and Billing Security

- Use hosted checkout or tokenized gateway components; never collect/store card security codes, UPI PINs or online banking passwords.
- Gateway secrets must live in a secret manager and never in platform settings or source control.
- Verify webhook signatures over exact raw bytes with provider-specific algorithms.
- Deduplicate webhook events by provider + event ID and process state transitions idempotently.
- Reconcile amount, currency, invoice, organization, provider reference and event state before marking invoices paid.
- Treat client redirects as UX only; never treat them as proof of payment.
- Apply RLS to tenant billing records and use transaction-local tenant context.
- Add audit logs for plan changes, subscription state, credits/refunds and privileged entitlement overrides.
- Tax invoices and retention must be reviewed for each operating jurisdiction.
