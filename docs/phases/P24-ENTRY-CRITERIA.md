# P24 Entry Criteria — Timetable Acceptance & Tenant UX

1. Add membership discovery and organization/school/academic-year pickers to the authenticated School Admin workspace; remove manual tenant ID entry.
2. Integrate shared auth state across the School Admin shell, not only the timetable tab.
3. Add a dry-run alias migration preview with exact source counts and target room validation before apply.
4. Add dual-control alias approval option and immutable migration audit events.
5. Execute Prisma validation/client generation and apply migrations to PostgreSQL under a non-owner application role.
6. Verify forced RLS, room triggers, alias FK and advisory-lock serialization with at least two concurrent connections.
7. Add API integration tests for pending → approved → applied, invalid room, duplicate alias, tenant isolation and rollback.
8. Add browser E2E for login/refresh/logout, timetable editor, room aliases and CSV/template flows.
9. Add database-level teacher/room overlap enforcement or a documented restricted-write model.
10. Run full web/API builds and report exact toolchain versions and results.
