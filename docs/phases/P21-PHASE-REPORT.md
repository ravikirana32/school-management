# P21 Phase Report — Timetable CSV, Templates & School Admin Editor

**Date:** 2026-11-16  
**Status:** Source implementation completed; runtime acceptance pending.

## Implemented

1. Added `BellScheduleTemplate` Prisma model and migration with school/organization FK, unique school/name, JSON array check, indexes and forced RLS.
2. Added strict CSV utility with quoted comma/quote handling, CRLF support, exact ordered headers, 1 MB and 500-row limits, row-level structural errors and CSV serialization.
3. Added CSV preview, transactional all-or-nothing import and scoped CSV export endpoints. Import revalidates assignment membership, active room codes and conflicts while holding the school/year advisory lock.
4. Added template list/create/apply endpoints. Template application is transactional, capped at 500 generated slots and checks assignment, room and teacher/room collisions.
5. Added School Admin timetable workspace with API-backed slot creation, assignment and canonical room pickers, templates, CSV preview/import/export and current slot list.
6. Added teacher mobile previous/next day and previous/next week date navigation.
7. New slot create/update, JSON bulk import, CSV import, template apply and exception writes validate canonical active room codes. Existing historical free-text room values are preserved; no unsafe automatic rewrite was attempted.
8. Updated root/docs gap registers, README, changelog, implementation status and P22 entry criteria.

## Verification

- Static source checks: PASS (see `P21-ARTIFACT-MANIFEST.json`).
- TypeScript/TSX syntax transpilation: PASS for changed API, CSV, tests, School Admin and Teacher mobile sources.
- CSV parser/serializer smoke checks: PASS (7 isolated Node checks for quoted cells, strict headers, malformed quotes, empty input, 500-row cap and export escaping); Vitest source tests added but not executed.
- Prisma schema validation/client generation: not run.
- PostgreSQL migration/RLS and multi-connection advisory-lock tests: not run.
- API integration and browser/mobile E2E: not run.
- Full project typecheck/build: not run.
- Cumulative ZIP integrity: PASS after packaging.

## Known limitations

- Preview checks CSV structure/schema; import performs authoritative database validation and can still reject the batch with row details.
- Import is synchronous, limited to 500 rows. Large imports need a queued job, progress, idempotency and retry handling.
- Bell template application assigns the template period label as the timetable subject display value; it does not infer curriculum subjects.
- The School Admin timetable workspace currently accepts a bearer token and tenant IDs manually; global app auth context integration remains open.
- Existing room labels are retained and need a reviewed alias/mapping workflow before migration.
- Advisory locks do not prevent direct SQL writes or writers that omit the lock protocol.
