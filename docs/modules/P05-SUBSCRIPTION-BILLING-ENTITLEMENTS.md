# P05 — Subscription, Billing and Entitlements

## Delivered source
- Global public subscription plans with monthly, quarterly and yearly prices, trial days, feature entitlements and numeric limits.
- Organization subscriptions with pending-payment/trial/active/past-due/paused/canceled/expired states, period dates, trial dates, cancellation metadata and external provider references. A non-trial subscription remains `PENDING_PAYMENT` until a verified payment reconciliation activates it.
- Partial unique index prevents more than one live subscription per organization.
- Invoices and invoice line items with currency, tax, discount, totals, payment state and billing snapshot.
- Payment attempts with organization-scoped idempotency keys.
- Webhook event store with provider/event uniqueness and payload hashes.
- Organization entitlement overrides with optional expiry.
- Billing API for plan catalogue, subscription start/read, invoice listing, checkout attempt placeholder, webhook intake and entitlement lookup.
- Gateway interface defines server-side checkout and raw-body webhook verification boundary.
- Seed plans Starter, Professional and Enterprise with provisional INR prices.

## Important product/finance assumptions
Seed prices are placeholders based on the earlier planning discussion and are not validated commercial pricing. Taxes are not calculated automatically. Currency is currently INR by default; international tax, currency conversion and invoice compliance need separate jurisdiction-specific work.

## Payment safety
- No card, CVV, bank credential or UPI PIN is stored.
- No real payment gateway is configured.
- Checkout endpoint creates an auditable `UNCONFIGURED` attempt and explicitly says no payment was initiated.
- Webhook route verifies an HMAC signature against raw request bytes when a provider secret is configured, stores event identity/hash and deduplicates event IDs. It does not mark invoices paid until a provider-specific reconciliation adapter is implemented.
- A production gateway must validate provider-specific signatures, amounts, currency, invoice references and event ordering.

## Entitlement semantics
Overrides take precedence over plan entitlements while not expired. Otherwise an active/trialing/past-due subscription grants only explicitly true plan feature flags. No subscription means denied. Limit values are returned as plan/override metadata; enforcement must be wired into each module's write path before claiming limits are enforced.
