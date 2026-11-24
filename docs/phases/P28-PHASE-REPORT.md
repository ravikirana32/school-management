# P28 Phase Report — Operational Workflows & Authorization Hardening

**Status:** Source implementation complete; runtime acceptance pending.

## Delivered

1. Curriculum subject creation and version activation/retirement.
2. Student admission with an optional primary guardian, enrollment and authorized pickup contact workflows.
3. Staff department/designation creation, searchable selectors, status changes and teacher assignment selectors.
4. Active school-member discovery, assignment listing/revocation and access audit view.
5. Granular backend permission checks across curriculum, students, staff and access routes.
6. Separate PII permissions for student and staff details, with application-level PII read audit events.
7. Unit-test source for exact/module/global permission matching.
8. P28 module/API/security docs, artifact manifest, P29 entry criteria and synchronized master gap registers.

## Static verification

- TypeScript/TSX syntax transpilation: 8 changed files PASS.
- Targeted static source assertions: 16/16 PASS.
- Root/docs master gap register synchronization: PASS.
- Cumulative ZIP integrity: verified after archive creation.

## Not executed

- pnpm install and lockfile generation.
- Prisma schema validation/client generation.
- PostgreSQL migrations, RLS and trigger tests.
- API integration tests.
- Vitest execution.
- Full TypeScript typecheck, Vite builds and lint.
- Playwright browser E2E.
- Expo builds/device tests.

Runtime acceptance is NOT VERIFIED. No claims of live database or browser functionality are made.

## Important limitations

- Guardian edit/merge, parent portal invitation and document binary upload remain incomplete.
- Staff employment-history editing and private document binary upload remain incomplete.
- Access audit endpoint returns only the latest 100 events.
- Curriculum active-version uniqueness is not database-enforced; concurrent activation tests remain open.
- Some unrelated APIs still require broad role-based access and need a full authorization inventory.
- Existing P00–P27 gaps are retained in the root and `docs/` master register.
