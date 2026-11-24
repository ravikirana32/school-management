# P29 migration note

`20261117100000_p29_curriculum_active_guard` adds partial unique indexes for ACTIVE curriculum versions.

Before deployment, inspect existing ACTIVE rows grouped by `(schoolId, academicYearId)`. The migration performs this preflight itself and aborts with the conflicting school/year if duplicates exist. Resolve those duplicates through a reviewed curriculum retirement decision, then retry. Do not edit production rows blindly to make the migration pass.

After deployment, verify both indexes, attempt concurrent activation from two database sessions, and run under the non-owner application role with existing RLS policies. Rollback should drop only the four P29 indexes; it does not change curriculum, guardian-link or employment-history rows.

The migration has not been applied in this development run.

The same migration preflights and adds two more partial unique indexes:

- one primary guardian link per student;
- one open employment-history period per staff member.

Guardian-link changes serialize by student ID; staff employment changes and separation serialize by staff-member ID. If the preflight finds existing duplicate primary links or open periods, migration aborts and requires a reviewed data correction. It never chooses a primary guardian or deletes history automatically.
