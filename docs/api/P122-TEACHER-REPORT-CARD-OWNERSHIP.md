# P122 — Teacher Report-Card Ownership

## Authorization rule
An authenticated user with an active `StaffMember` in the requested organization and school is treated as a staff user for report-card reads. Such a user can see only report cards for students with an `ENROLLED` `StudentEnrollment` matching one of the user's active `TeacherAssignment` records for the current date, including academic year, grade level and section.

Assignments with a future `startsOn` or past `endsOn` are excluded. The staff record must be `ACTIVE`; the assignment must be `isActive`. All queries include organization and school identifiers and execute inside `withTenantContext`.

## Protected read surfaces
- Report-card list filters `studentId` to the teacher's assigned student IDs.
- Artifact metadata lookup first resolves the report card within the tenant, then checks teacher assignment before returning the artifact or signed URL.
- Published PDF download performs the same ownership check before issuing a signed URL.

## Deliberate limitation
Historical access and substitute/cover-teacher rules are not inferred. The current implementation uses assignments active on the current date and current `ENROLLED` student records. Schools must define historical and substitution policy before extending access.

## Remaining audit
Student PII/guardian details, fees, attendance historical records, staff-document access, workers and internal-service paths require further handler-by-handler review and runtime verification.
