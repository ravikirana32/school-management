# P58 — Suppression release concurrency guard

## Delivered
- Added conditional release transition scoped by suppression ID, organization, school and ACTIVE status.
- Added release audit event only for the winning transition, in the same transaction.
- Preserved unique-index protection and duplicate-create re-read behavior.

## Validation
Static verifier 7/7 PASS. PostgreSQL race/transaction/RLS acceptance remains NOT RUN.

## Test result
- Static verifier 7/7 PASS.
- TypeScript syntax 1 file, 0 diagnostics.
- PostgreSQL runtime acceptance NOT RUN.
