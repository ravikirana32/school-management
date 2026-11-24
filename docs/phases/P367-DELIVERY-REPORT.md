# P367 — C2-02 Database Integrity, Migration Safety & Tenant Isolation

## Scope
Single-phase source-level completion pass for C2-02: inventory Prisma models and migrations, audit tenant-scoped model indexing and tenant-context helpers, address a tenant lookup indexing gap, and register database-runtime acceptance items transparently.

## Changes
- Added `scripts/audit-c2-02-database-tenant-isolation.mjs` (dependency-free inventory of Prisma model counts, tenant-scope fields, tenant scope index/unique coverage, migration inventory, RLS/tenant-named migration inventory, SQL acceptance inventory, and required tenant-context helper presence).
- Added `scripts/verify-c2-02-audit-contract.mjs` self-contract verifier.
- Added root commands `audit:c2-02:db-tenant` and `verify:c2-02:audit-contract`.
- Integrated P367 audit contract into the source-only CI gate.
- Added composite tenant index for `TransportTripEvent` and SQL migration `20261120190000_p367_transport_trip_event_tenant_index`.
- Updated feature inventory, changelog, active/open gap registers and docs mirrors.

## Results
- Prisma models: 165.
- Models containing organizationId and/or schoolId: 150.
- Tenant-scoped model scope-index/unique audit: 150/150 PASS.
- Required tenant context helpers: 6/6 present.
- Migration directories: 104.
- SQL acceptance files: 2.

## Limitations / open acceptance
This is static source inspection only. Prisma validation/generation, fresh database migration, baseline upgrade, rollback/recovery, PostgreSQL RLS catalog checks, non-owner DB-role tests, cross-tenant negative tests, IDOR, tenant isolation in workers/cache/storage, concurrency/race tests, and API integration tests remain unexecuted because the dependency/database environment is not available. C2-02 implementation source audit is complete for this phase, but runtime acceptance gaps remain OPEN; they are not represented as passed.

Detailed runtime acceptance checklist: `C2-02-ACCEPTANCE-GAP-MATRIX.md`.
