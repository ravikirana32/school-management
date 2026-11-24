# P27 Phase Report — Operational Modules API Integration

**Status:** Source implementation completed; runtime acceptance pending.

## Delivered
1. Replaced the curriculum, student, staff and access local-preview screens with `OperationalModulesWorkspace`.
2. Connected board catalogue/profile, grade and curriculum-version reads/writes.
3. Connected student paginated search/list and student admission creation.
4. Connected staff search/list, department/designation/assignment reads, staff creation and teacher assignment creation.
5. Connected role and permission catalogue reads, custom role creation and role assignment by existing member/role IDs.
6. Used the shared School Admin authenticated request helper and active tenant membership context.
7. Added API matrix, security notes, phase report, artifact manifest and P28 entry criteria.
8. Updated README, changelog, implementation status and root/docs master gap registers.

## Verification performed
- TypeScript transpile syntax checks for 3 changed TSX files (PASS).
- 12 targeted static source assertions for API routes, authenticated request helper, module routing, tenant scope and removal of local preview badges (PASS).
- ZIP archive integrity check (PASS; final archive contains P00–P27).

## Not performed
- Dependency installation or lockfile generation.
- Full TypeScript typecheck, Vite build or lint.
- Prisma validation/client generation or migrations.
- PostgreSQL/RLS runtime tests.
- API integration tests, Vitest execution or Playwright browser E2E.

## Limitations carried forward
- Student guardian editing, enrollment, pickup contacts and private document upload are not exposed in the UI.
- Staff department/designation create, document workflows, account linking and full employment lifecycle are not exposed.
- Teacher assignment uses raw school-scoped IDs rather than searchable pickers.
- Role assignment uses raw user/role IDs; no member search, assignment listing/revocation or audit timeline UI.
- Backend student/staff/access routes remain School Admin-gated in multiple places; granular module permissions are incomplete.
- Curriculum subject creation/listing and version lifecycle are not yet exposed in this workspace.
