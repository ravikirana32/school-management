# P29 — Guardian and Staff Lifecycle Workflows

## Delivered source workflows

### Guardian directory
- School-scoped guardian list for a student, requiring `students.read` and `students.pii.read`.
- Explicit guardian link/create endpoint. A matching email or normalized phone returns `409 GUARDIAN_MATCH_FOUND`; no automatic merge occurs.
- Existing guardian IDs are accepted only when the guardian belongs to the same organization and school and is active.
- Duplicate student/guardian links return `409`.
- Primary guardian changes clear the previous primary link in the same transaction and serialize by student ID. A partial unique index enforces one primary link per student.
- Guardian and relationship fields can be updated through a school-scoped PATCH endpoint. The caller must hold both `students.update` and `students.pii.read`.
- Guardian reads and writes emit actor-attributed audit events.

### Staff employment history
- Read a staff member's employment periods.
- Record a new effective employment period with department, designation and employment type.
- The current open period is closed on the day before the new period starts.
- Effective dates must move forward; separated staff cannot receive new employment periods through this workflow. Changes and separation serialize by staff-member ID; a partial unique index enforces one open employment period per staff member.
- Staff current department/designation/employment type are updated transactionally with the history row and an actor-attributed `StaffAuditEvent`.
- Termination/resignation closes the open employment-history period.

### Curriculum activation guard
- API activation obtains a transaction-scoped advisory lock per school and academic year.
- A P29 migration preflights existing active versions and intentionally aborts if duplicates exist; it does not silently mutate production curriculum records.
- Partial unique indexes enforce one active curriculum version per school/year, including a separate one-active-without-year rule.

## Not delivered / explicitly deferred
- Parent-account invitation is not implemented. A secure flow needs verified guardian contact ownership, identity linking, consent, invitation delivery, expiry/revocation and account recovery. An email address on a guardian record is not proof of ownership.
- Student/staff binary document upload/download is not implemented. Metadata registration is not a file-storage workflow. Private object storage, short-lived signed access, malware scanning/quarantine, content-type verification, size limits and retention controls must be configured first.
- No guardian merge operation is provided. Possible duplicates require a separately reviewed merge tool with complete foreign-key reconciliation and audit history.

## Security boundaries
- All operations require active school membership and granular permissions.
- Guardian details are treated as PII; list/detail/update operations require `students.pii.read` in addition to the relevant functional permission.
- Guardian lookup is tenant-scoped. Duplicate candidates are not automatically merged.
- Employment history is append-oriented; prior periods are closed rather than overwritten.
