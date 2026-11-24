# P05 Phase Report — Subscription, Billing and Entitlements

## Delivered in source
- Added plans, subscriptions, invoices, invoice lines, payment attempts, webhook events and entitlement override models.
- Added migration with foreign keys, indexes, one-live-subscription-per-organization constraint and RLS for organization subscription, invoice, payment attempt and entitlement override tables.
- Added public plan catalogue and Starter/Professional/Enterprise seed data.
- Added organization admin subscription start, member subscription/invoice read APIs.
- Added checkout attempt placeholder with organization idempotency key.
- Added payment gateway adapter interface and HMAC webhook verification/deduplication foundation.
- Added entitlement resolution endpoint and service helper.
- Added P05 schema tests and billing/payment security documentation.

## Static review corrections
- A non-trial subscription is created as `PENDING_PAYMENT`, never `ACTIVE`, until a verified gateway reconciliation activates it. The database live-subscription constraint includes pending-payment subscriptions to prevent duplicate checkout subscriptions.
- Subscription-to-plan reads use scalar `planId` lookups because the baseline schema uses scalar foreign keys without Prisma relation declarations.
- Webhook event insertion handles duplicate delivery races by re-reading the unique provider/event key after a concurrent insert conflict.

## Verification
- Static source and route checks performed during artifact generation.
- Cumulative ZIP integrity checked.
- No package installation, Prisma validation/generation, migration execution, database startup, TypeScript build, API tests or gateway sandbox tests are claimed as passed.

## Outstanding before production
- Implement a real gateway adapter (e.g. Razorpay/Stripe/PayU as selected), checkout session creation and verified reconciliation.
- Generate invoices automatically and implement tax/GST rules, credit notes, refunds and downloadable PDFs.
- Add subscription renewals, proration, upgrades/downgrades, cancellation and dunning.
- Enforce entitlements and plan limits in every relevant module and background job.
- Add platform-admin plan CRUD and controlled plan versioning.
- Add currency/jurisdiction-specific tax and invoice compliance.
- Add webhook retry/out-of-order handling and end-to-end gateway tests.
- Test RLS and webhook signature/idempotency against a live PostgreSQL and provider sandbox.
