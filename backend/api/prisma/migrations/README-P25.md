# P25 migration notes

Migration `20261117100000_p25_school_admin_and_timetable_guards` adds database-side safeguards:

- Serializes timetable slot and exception writes using the same school-scoped advisory lock used by P22/P23.
- Rejects recurring teacher and room overlaps for active timetable slots, including overlapping effective-date ranges.
- Rejects date-specific substitute/override teacher and room overlaps against the effective schedule for that date; cancellations do not consume a teacher or room.
- Makes `AuditLog` append-only by rejecting direct SQL `UPDATE` and `DELETE`.

## Deployment requirements

1. Back up the database and apply migrations in order using the migration owner.
2. Run the acceptance SQL in `docs/testing/P25-postgres-acceptance.sql` using the normal application database role and a tenant context.
3. Ensure every API timetable writer continues to use `withTenantContext` and transactions. The database triggers independently serialize writes for direct SQL callers too.
4. Review existing overlapping timetable data before deployment. The new triggers reject new writes; they do not rewrite or delete existing rows.
5. Verify the application DB role cannot disable triggers or alter migration-owned functions. Do not grant it table ownership, superuser or `BYPASSRLS` privileges.

The migration has not been applied in this development environment; runtime acceptance remains pending.
