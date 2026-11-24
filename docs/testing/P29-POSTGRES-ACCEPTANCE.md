# P29 PostgreSQL acceptance checklist

Run only against a disposable PostgreSQL database first. Use the same non-owner role and RLS session settings as the API runtime.

## Migration preflight

1. On a clean database, deploy all migrations and confirm P29 creates:
   - `CurriculumVersion_one_active_per_school_year`
   - `CurriculumVersion_one_active_without_year_per_school`
   - `StudentGuardian_one_primary_per_student`
   - `StaffEmploymentHistory_one_open_period_per_staff`
2. On a disposable fixture, insert duplicate ACTIVE curriculum versions for one school/year; confirm P29 aborts with the school/year identifier.
3. Repeat for duplicate primary guardian links and multiple open employment periods; confirm migration aborts without changing existing rows.
4. Remove the deliberate fixture conflicts and confirm migration deploys.

## Constraint checks

- Attempt a second primary guardian link for one student in a separate SQL transaction; expect unique violation.
- Attempt a second `endsOn IS NULL` employment-history row for one staff member; expect unique violation.
- Attempt a second ACTIVE curriculum version for the same school/year; expect unique violation.
- Confirm a different academic year may have a separate ACTIVE curriculum version.

## Concurrency checks

Use two independent sessions to activate two versions for the same school/year concurrently. Exactly one should remain ACTIVE; one transaction must fail or retire the competing version through the API workflow. Repeat with two primary-guardian mutations and two employment-history changes for the same student/staff record.

## RLS and permission checks

- A non-member cannot list guardian links or employment history.
- A member without `students.pii.read` cannot read or modify guardian PII.
- A member without `staff.pii.read` cannot read or modify employment history.
- Cross-school IDs return not found and do not disclose whether a foreign record exists.
- Audit rows are created for guardian PII reads and writes and staff employment-history reads/changes.

No P29 PostgreSQL acceptance tests were executed during source implementation. Record database version, migration logs, SQLSTATEs and test outputs before closing the gaps.
