# P65 — Versioned suppression hash aliases

## Delivered
- Added versioned hash-alias model/table with partial active uniqueness and tenant/worker RLS.
- Backfilled existing suppression hashes.
- API creates aliases for all configured current/previous key versions and releases aliases atomically.
- Worker checks direct rows and aliases; webhook creates alias for bounce/complaint suppression.

## Validation
Static verifier 10/10 PASS. Prisma/PostgreSQL/Vitest runtime acceptance remains NOT RUN.

## Test result
- Static verifier 10/10 PASS.
- TypeScript syntax 4 files, 0 diagnostics.
- Prisma/Vitest/PostgreSQL runtime acceptance NOT RUN.
