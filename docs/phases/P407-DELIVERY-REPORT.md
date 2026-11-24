# P407 Delivery Report — Campus Registry Foundation

## Scope and implementation
P407 introduces a persisted tenant/school-scoped campus registry to stop treating campus identifiers as free-form inheritance-only records.

### Migration
`backend/api/prisma/migrations/20261121150000_p407_campus_registry/migration.sql` creates `SchoolCampus` with code, name, description, status, main-campus marker, actor/timestamps, tenant indexes, case-insensitive code uniqueness, one active main-campus partial unique index, field/status constraints and forced tenant RLS.

### API implementation
`backend/api/src/modules/schools/school-config.routes.ts` adds permission-gated list/create/update/archive routes. Create/update use tenant context transactions; setting a main campus clears the previous main designation in the same transaction. Campus updates check target existence before changing the main designation. Archiving is soft (status=ARCHIVED) and clears the main flag. Audit events are recorded.

Inheritance save and effective campus views are integrated with registry validation: inheritance target and parent must be active registry campuses; effective views reject unknown or inactive campus IDs.

### Files
- Migration: P407 campus registry table.
- API: campus registry CRUD and registry-backed inheritance validation.
- Verifier: `scripts/verify-p407-campus-registry.mjs`.
- Package script: `verify:p407`.

## Limitations
This is not a full campus UI or end-to-end runtime acceptance. Database migration execution, Prisma schema/client alignment (raw SQL table intentionally does not require Prisma model generation), API runtime, browser/mobile, and E2E testing have not been performed. Campus uniqueness/main-campus behavior is source-verified only.

## Cumulative package
P407 cumulative ZIP: 2,938 file entries; approximately 4.81 MB. All 2,924 P406 baseline file paths preserved (0 missing), 14 additional file paths, 0 duplicate entries and CRC integrity PASS. SHA-256 is in the external sidecar.
