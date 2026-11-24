# P29 Entry Criteria — Admissions, Staff Lifecycle & Operational Acceptance

1. Complete guardian editing, guardian deduplication and verified parent-account invitation.
2. Implement private object-storage upload/download flows for student and staff documents, including malware scanning and signed access.
3. Complete staff employment-history changes, department/designation reassignment and separation workflow.
4. Add curriculum version concurrency protection and database constraints for one active version per school/academic year where business rules allow.
5. Add complete PII access inventory and role/field-level authorization tests.
6. Add school-scoped pagination/search for member and access audit views, with export/retention policy.
7. Run Prisma validation, clean migrations, PostgreSQL RLS and permission integration tests using a non-owner DB role.
8. Run Vitest, full TypeScript checks, all web builds and Playwright E2E for curriculum, student, staff and access workflows.
9. Reconcile all carried P00–P28 gaps; close only with implementation and verification evidence.
