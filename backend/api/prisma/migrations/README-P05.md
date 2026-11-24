# P05 migration notes

Apply migrations in timestamp order after P01-P04. The P05 migration creates global plan catalog tables and organization-scoped subscription/invoice/payment/override tables. The webhook event table is provider-global and is not tenant RLS protected; production webhook workers must use a dedicated least-privilege DB role and strict provider verification.

The partial unique index `OrganizationSubscription_one_live_per_org_idx` enforces one live subscription per organization at the database layer. If a future product decision permits parallel add-ons or multiple subscription products, replace this constraint with a product-scoped uniqueness rule before migration.
