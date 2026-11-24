# P25 Database — timetable overlap and audit guards

Migration: `20261117100000_p25_school_admin_and_timetable_guards`.

## Timetable slots

A BEFORE INSERT/UPDATE trigger locks by organization/school, resolves the assigned staff member, then rejects any active same-school/same-academic-year/same-weekday time overlap where either the staff member or canonical room is shared. Effective date ranges must intersect for a conflict. Adjacent periods are valid.

## Date-specific exceptions

A BEFORE INSERT/UPDATE trigger locks by organization/school and evaluates the exception date's ISO weekday. SUBSTITUTE uses the substitute assignment; OVERRIDE uses the original teacher with the overridden time/room; CANCEL is non-occupying. The trigger compares the effective occurrence against other slots and their active exceptions on that date. Substitute assignment is mandatory for SUBSTITUTE.

## Audit log

BEFORE UPDATE and BEFORE DELETE triggers raise SQLSTATE `55000`. Audit rows remain append-only through Prisma and direct SQL paths that do not disable triggers.

## Limitations and rollout

- Existing conflicts are not removed by this migration and must be reviewed before applying it.
- A privileged owner/superuser can disable triggers; the runtime role must not own these tables or hold elevated privileges.
- This migration has not been applied or executed in the current environment.
