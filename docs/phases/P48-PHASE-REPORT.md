# P48 — Versioned suppression HMAC key rollover

## Scope
Implement safe current/previous HMAC key overlap for P46/P47 school-local email suppression, while preserving privacy and existing rows.

## Implementation
- Added `hashVersion` to suppression records; migration tags existing records `v1`.
- Added current/previous key resolution helper and backwards-compatible legacy secret handling.
- API duplicate detection hashes the submitted email under every configured key version; new records use current key/version.
- Worker pre-send check computes hashes under every configured key version.
- No cleartext email or reversible data added.

## Important limitation
One-way HMAC records cannot be rehashed without the original email. The previous key must remain available until no active rows use its version and an approved retention policy allows retirement. This is intentionally not represented as a bulk rehash.

## Validation
See `P48-TEST-REPORT.md`. Static checks and TS syntax checks are separate from Prisma/PostgreSQL/RLS/worker runtime acceptance.

## Test result
- Static verifier: 11/11 PASS.
- TypeScript syntax transpilation: 4 files, 0 syntax diagnostics.
- Runtime acceptance remains NOT VERIFIED; see `P48-TEST-REPORT.md`.
