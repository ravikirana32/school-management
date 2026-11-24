# P29 database invariants

## Curriculum active-version uniqueness

Migration `20261117100000_p29_curriculum_active_guard` performs a preflight for duplicate ACTIVE curriculum versions. If a duplicate school/year group exists, migration stops with an actionable error. After remediation, two partial unique indexes enforce:

- one ACTIVE row for each `(schoolId, academicYearId)` when academicYearId is not null;
- at most one ACTIVE row for a school when academicYearId is null.

The API additionally serializes activation with `pg_advisory_xact_lock(hashtextextended(...))` inside the tenant transaction. Direct SQL writes are still constrained by the unique indexes.

## Employment periods

P29 appends new `StaffEmploymentHistory` periods and closes the previous open period at the day before the next period's effective date. The API prevents overlapping sequential periods for the ordinary workflow. A database exclusion constraint for arbitrary overlapping historical periods is not added in P29; migration/backfill and legacy data review are required before such a constraint can safely be introduced.

## Guardian identity

Guardian matching is a review aid, not a uniqueness invariant. Shared family contacts and guardians with changed phone/email values are valid scenarios. No global unique email/phone constraint is added.

## Primary guardian and open employment period invariants

The same P29 migration preflights duplicate primary guardian links and duplicate open employment-history periods, then adds partial unique indexes:

- at most one `StudentGuardian` row with `isPrimary = TRUE` per student;
- at most one `StaffEmploymentHistory` row with `endsOn IS NULL` per staff member.

Guardian primary-link mutations serialize by student ID; employment changes and separation serialize by staff-member ID using transaction-scoped advisory locks. The indexes remain the final database guard for concurrent API/direct-SQL writes. Migration aborts rather than silently selecting a primary guardian or deleting employment rows.
