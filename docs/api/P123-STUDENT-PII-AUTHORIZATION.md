# P123 Student PII and Teacher Authorization

## Student detail response
The student detail handler uses an explicit Prisma `select`. Core identity and school lifecycle fields are returned to users with `students.read`; demographic, contact, address and notes fields are conditional on `students.pii.read`. Enrollment fields are explicitly allowlisted.

## Teacher assignment boundary
`canTeacherAccessStudent` detects the built-in `SCHOOL_TEACHER` role. Unless the user also has an elevated `students.update` or `academics.manage` permission, the helper requires an active staff member and a currently active teacher assignment matching an enrolled student's academic year, grade and section. The helper is used for student detail, guardian details, and student document upload initiation, completion and download.

## Fees
The school fee list requires `fees.read`. The seeded built-in teacher role does not include that permission. Parent fees are a separate consent-bound flow requiring `parent.fees.read`.

## Verification limitations
Source-level checks do not establish runtime security. Validate custom role combinations, role revocation, assignment effective dates, cross-school identifiers, document URL issuance, and fee access with a non-owner database role before production use.
