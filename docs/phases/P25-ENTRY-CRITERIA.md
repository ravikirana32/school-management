# P25 Entry Criteria — School Admin Shell & Timetable Database Acceptance

1. Migrate remaining School Admin tabs from local preview to shared authenticated context or clearly separate preview-only modules.
2. Add shared route/module permission guards and capability-aware navigation.
3. Execute PostgreSQL migration, RLS and trigger tests with a non-owner application role.
4. Add integration tests for membership discovery, inactive membership, school lifecycle and academic-year isolation.
5. Add browser E2E for login, refresh, logout, membership/school/year selection, attendance and timetable workflows.
6. Verify maker-checker alias workflow, preview accuracy, audit rollback and tenant isolation.
7. Add database-level teacher/room overlap enforcement or a fully enforced restricted-write stored-procedure model.
8. Harden audit log against application and direct SQL mutation/deletion.
9. Run full pnpm install, lockfile generation, Prisma validation/client generation, typecheck, build and Vitest; record tool versions and logs.
10. Carry every unresolved gap forward; close only with implementation and reproducible evidence.
