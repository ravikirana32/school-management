# P27 Entry Criteria — School Configuration Acceptance & Curriculum Persistence

1. Run pnpm install with a generated/committed lockfile and record exact versions.
2. Validate Prisma schema, generate client and apply all migrations to disposable PostgreSQL.
3. Execute school profile, academic-year entitlement, calendar event, working-day and policy API integration tests.
4. Verify cross-tenant negative cases and RLS under a non-owner application role.
5. Run full School Admin TypeScript typecheck/build and Vitest, including P26 tests.
6. Add Playwright flows for login, school switching, profile save/reload, academic year creation, calendar event creation and permission denial.
7. Connect curriculum/board configuration to authenticated APIs with validation and audit.
8. Review whether academic-year creation should permit multiple current years under concurrent requests; add database uniqueness/transaction protection if required.
9. Carry every unresolved P00–P26 gap forward; close only with implementation and reproducible verification evidence.
