# P514 Delivery Report — Billing & Invoice Lifecycle

## Delivered
- New `SchoolFeeInvoice` and `SchoolFeeInvoiceLine` models with tenant-scoped relations, per-school invoice number uniqueness, immutable billing snapshot JSON, due date, status and void metadata.
- Migration creates both tables, compound tenant foreign keys, amount check constraints, indexes, and forced row-level security policies.
- Scoped `fees.read` invoice list/detail APIs.
- `fees.manage` invoice draft generation from published/partially-paid/overdue fee charges; one invoice per charge with transaction advisory lock and unique constraint protection.
- Approved concessions snapshot into gross, concession and net totals; calculations use integer minor units.
- Installment schedule becomes itemized invoice lines; concession is allocated across lines with the last line taking the rounding remainder.
- Existing payments reduce invoice amount due at creation; paid charges are excluded from invoice generation.
- Draft invoice issue endpoint; issued invoice cannot be re-issued/edited through lifecycle API.
- Draft/issued invoice void endpoint requires a reason; issued invoices with recorded charge payments are blocked from voiding.
- Audit events for draft creation, issue and void.
- Finance UI loads invoice rows, creates invoice drafts from eligible fee charges, issues draft invoices, and voids with a prompted reason.
- Added focused verifier `scripts/verify-p514-school-fee-invoices.mjs`.

## Verification
- P514 focused static assertions: 43/43 PASS.
- P509–P514 focused verifiers: all scripts exit 0 (P509 23/23, P510 parser audit 0 diagnostics, P511 16/16, P512 13/13 plus arithmetic edge checks 6/6, P513 27/27, P514 43/43).
- TypeScript parser diagnostics: 0 for modified backend routes and FinanceWorkspace TSX.
- ZIP CRC and external SHA-256 verified after packaging.
- Prisma validate/generate, migration application, full typecheck/build, API runtime, database RLS, browser/mobile and E2E remain pending local environment validation.

## Open gaps carried forward
- Configurable sequential invoice numbering/prefix.
- Invoice printing/PDF, branding and tax/GST.
- Payment and installment allocations against invoice; live amountDue reconciliation.
- Parent/student portal invoice integration.
- Ledger reversal/credit-note policy and runtime verification.
See root `MASTER-OPEN-GAPS-REGISTER.md`, P514 section.
