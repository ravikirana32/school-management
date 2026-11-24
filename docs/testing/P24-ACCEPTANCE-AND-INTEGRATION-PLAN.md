# P24 Acceptance & Integration Plan

## Static checks executed

- TypeScript syntax transpilation for changed API and School Admin TS/TSX source.
- Source assertions for membership-only discovery, tenant-context resolution, shared session provider, no manual token/tenant inputs in attendance/timetable, refresh retry, academic-year picker, alias preview, maker-checker and audit events.
- Root and `docs/` master gap register synchronization.
- Cumulative ZIP integrity.

## Required runtime tests (not executed in this environment)

1. Apply all migrations to PostgreSQL using a non-owner application role.
2. Verify `GET /organizations/me/schools` returns only active memberships and no cross-tenant schools.
3. Verify inactive organization/school and revoked membership are excluded.
4. Verify academic-year endpoint is membership scoped and cannot be used to read another school.
5. Verify login → membership discovery → school selection → academic-year selection → timetable and attendance API access.
6. Verify refresh rotation, simultaneous 401 behavior, expired refresh, logout and refresh-token reuse rejection.
7. Verify alias preview counts include active and inactive matches and performs no writes.
8. Verify creator self-approval returns 403; second admin approval succeeds.
9. Verify create/approve/apply audit events are committed atomically and rollback with failed alias operations.
10. Verify apply counts are recomputed when data changes after preview.
11. Run browser E2E for all above and test responsive layout/accessibility.
12. Run full API/web typecheck, builds and Vitest suite.
