# P25 Security — Permission guards, timetable conflicts and audit immutability

- Client navigation is not a security boundary; API routes enforce membership and `academics.manage` or SCHOOL_ADMIN.
- The `SCHOOL_ADMIN` role receives the permission catalogue through the idempotent seed and onboarding flow. Other baseline roles remain least-privilege.
- All timetable slot and exception writes acquire the same transaction-scoped school advisory lock, including direct SQL writes that fire triggers.
- The slot trigger rejects active recurring teacher/room overlaps for intersecting effective-date ranges.
- The exception trigger rejects substitute/override conflicts against the effective schedule for that calendar date. Cancellations are exempt.
- AuditLog rejects UPDATE and DELETE at the database layer. Append-only does not by itself guarantee retention, external tamper evidence or privileged-owner protection; production operations must restrict ownership and migration privileges and export audit records to protected storage.
- Do not grant the application role superuser, table ownership, trigger-disable privileges or `BYPASSRLS`.
- Database migration and non-owner role tests remain unexecuted; treat the safeguards as implemented source, not runtime-verified controls.
