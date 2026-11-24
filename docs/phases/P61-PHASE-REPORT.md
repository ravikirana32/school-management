# P61 — Canonical webhook contract versioning

## Delivered
- Added v1 default and explicit version validation to canonical event schema.
- Persisted contract version in delivery event ledger with additive migration.
- Preserved old payload compatibility and provider/event uniqueness.

## Validation
Static verifier 7/7 PASS. Prisma/Vitest/PostgreSQL runtime acceptance remains NOT RUN.

## Test result
- Static verifier 7/7 PASS.
- TypeScript syntax 3 files, 0 diagnostics.
- Prisma/Vitest/PostgreSQL runtime acceptance NOT RUN.
