# P582 Next Phase Tasks — Demo data expansion and runtime acceptance

1. Run Docker Compose config/build/up on a Docker-enabled host.
2. Deploy all Prisma migrations to a clean PostgreSQL database.
3. Run the demo seed and verify each expected count from PostgreSQL.
4. Run the seeder a second time; verify no duplicate records/role assignments and stable counts.
5. Test all 14 role logins, tenant selection, role/permission scope and negative cross-tenant access.
6. Verify seeded records in list/detail/dashboard pages using API and Playwright evidence.
7. Expand valid module-specific fixtures for library, transport, hostel, canteen, payroll, health, documents and other uncovered pages.
8. Do not fabricate provider callbacks, payment settlement, payroll disbursement, guardian consent or safeguarding completion.
9. Keep the root and docs gap-register mirrors byte-identical and close gaps only with reproducible evidence.
