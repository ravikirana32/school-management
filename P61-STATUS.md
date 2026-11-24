# P61 Status — Canonical webhook contract versioning

**Status:** Source implementation and test source complete; Prisma/PostgreSQL acceptance pending. **Production approval: NOT GRANTED.**

- Canonical event schema now accepts optional `contractVersion`, defaults omitted legacy payloads to `v1`, and rejects unsupported versions.
- Delivery event ledger persists `contractVersion`; historical rows receive `v1` through additive migration.
- Existing provider/event uniqueness and strict payload shape remain unchanged.
- Static verifier 7/7 PASS; TypeScript syntax 3 files, 0 diagnostics; Prisma validate/generate/migration and Vitest NOT RUN.
- Future v2 schema remains intentionally undefined until requirements and provider mapping are reviewed.
