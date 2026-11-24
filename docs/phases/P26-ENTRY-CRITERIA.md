# P26 Entry Criteria — School Admin Persistence & Runtime Acceptance

1. Integrate school profile, academic year, calendar, working-day and policy screens with their existing APIs.
2. Connect curriculum, student, staff and access screens to authenticated endpoints with field-level permissions and pagination.
3. Run P25 migration on a disposable PostgreSQL database; test recurring and date-specific conflicts, adjacent periods, effective date ranges and two-connection races.
4. Verify audit UPDATE/DELETE rejection using the normal application role; document privileged DBA controls and external retention.
5. Run Prisma validation/client generation, full typecheck, web/API builds and Vitest; record exact tool versions and logs.
6. Add Playwright coverage for permission-aware navigation, forbidden routes, login, school switching, attendance and timetable.
7. Verify tenant RLS using non-owner application roles and negative cross-tenant tests.
8. Review and remediate pre-existing timetable conflicts before production migration.
9. Carry every unresolved P00–P25 gap forward; close only with reproducible implementation and verification evidence.
