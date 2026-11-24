# P512 Status — Installments & Payment Schedules

**Status:** Completed — source implementation and focused verification. Runtime acceptance remains user-local.

## Cycle 2
- C2-01 through C2-07: source phase sequences complete; local runtime/build/device/E2E acceptance pending.
- C2-08 Finance & Fee Management: **4/12 phases complete (P509–P512), 8 remaining**.
- P513 Discounts, Scholarships & Concessions is next.

## Scope delivered
- Tenant-scoped schedule and installment persistence models and SQL migration.
- Draft schedule read/create/update API endpoints with school scope and `fees.read` / `fees.manage` authorization.
- Schedule creation locked per charge; duplicate schedule creation returns conflict.
- Only unapproved, unpaid draft charges are eligible for create/update.
- 1–24 installments and 1–12 month interval limits.
- Integer-cents distribution with deterministic remainder reconciliation.
- Monthly date generation clamps month-end dates, including leap-year February.
- Audited schedule create/update events.
- Finance workspace UI to configure, read and edit a schedule and show rows.
- Cumulative gap register updated and synchronized.

## Local acceptance pending
- Prisma validation/generation and clean-database migration execution.
- API integration tests, tenant-negative tests and RBAC-negative tests.
- Frontend build/typecheck and browser/runtime checks.
- Schedule-to-payment allocation linkage is intentionally planned for P515.
- Parent/student mobile schedule visibility and schedule publication/invoice lifecycle are carried forward.
