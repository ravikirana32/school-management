# P73 — Student Lifecycle and Status History

## Delivered
- Allowed transition matrix for applicant, active, inactive, transferred, graduated, withdrawn and archived.
- `StudentStatusHistory` Prisma model and RLS migration.
- Permission-gated history and transition API endpoints.
- Conditional status update and atomic history/audit persistence.
- Unit-test source and static verifier.

## Acceptance still required
- `prisma validate`, `prisma generate`, migration deploy and RLS catalog audit.
- Vitest and concurrent status-transition integration tests.
- School Admin workflow for transfer/graduation/withdrawal and history viewing.
- Product/legal review of retention and transfer certificate requirements.
