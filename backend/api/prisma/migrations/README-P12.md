# P12 Migration

Migration: `20261116210000_p12_student_attendance`.

Apply after P11 with `prisma migrate deploy`. The migration adds four enums and four tables, composite tenant-scoped foreign keys, uniqueness and state checks, and forced RLS.

Before production:
- Validate Prisma schema and generated client.
- Confirm the composite FK column order matches existing unique indexes.
- Test `ON DELETE SET NULL` behavior for the composite audit FK (PostgreSQL may require nulling all FK columns; verify).
- Test RLS using the actual application database role.
- Test both clean install and upgrade from P11.
