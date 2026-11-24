# P33 migration — Parent finance and academics

Migration: `20261117140000_p33_parent_academics_finance`.

Creates tenant-scoped student fee charges and manual payment records, published homework assignments, published report cards, and per-parent notifications. All five tables use forced RLS with the organization/school transaction context. Composite student foreign keys prevent cross-school references. Payment reconciliation uses a transaction-scoped advisory lock, unique school/charge/reference, and an outstanding-balance check.

Before deployment: run Prisma validate/generate, apply on a disposable PostgreSQL database, inspect generated SQL drift, verify constraints/RLS as a non-owner application role, and test concurrent payment writes. No online gateway is connected by this migration.
