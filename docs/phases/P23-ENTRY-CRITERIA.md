# P23 entry criteria

1. Install dependencies and generate lockfile; validate Prisma schema and generated client.
2. Apply all migrations including P22 to clean and upgraded PostgreSQL databases.
3. Add API/RLS tests for room lifecycle and trigger invariants using the application DB role.
4. Add reviewed room alias registry and preview/approve migration workflow with audit trail.
5. Integrate School Admin timetable editor with shared auth and selected tenant context.
6. Run browser E2E for room lifecycle, timetable editor, CSV and templates.
7. Run teacher mobile iOS/Android tests for SecureStore cache, week grid, offline read-only behavior and sign-out cleanup.
8. Decide whether offline attendance queue is in scope and define conflict/replay rules before implementation.
