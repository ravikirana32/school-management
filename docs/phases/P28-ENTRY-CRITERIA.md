# P28 Entry Criteria — Operational Workflows & Authorization Hardening

1. Add searchable grade, staff, member and role pickers; remove raw ID entry from normal admin flows.
2. Add student enrollment, guardian management and pickup-contact UI with field-level PII access controls.
3. Add staff department/designation management, assignment editing/deactivation, employment history and secure document lifecycle UI.
4. Add curriculum subject mapping, version activation/retirement and audit history.
5. Add role assignment listing, revocation, member search and permission-diff confirmation.
6. Migrate student/staff/access API routes from broad School Admin checks to explicit granular permissions with deny-by-default tests.
7. Add server-side audit events for role and permission mutations and student/staff sensitive actions.
8. Add API integration tests for entitlement, cross-tenant, role and PII boundaries.
9. Add Playwright E2E for curriculum, student admission, staff assignment and access administration.
10. Run full workspace install, lockfile, Prisma validation, database migrations, builds, typechecks and Vitest in CI.
