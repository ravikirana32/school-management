# P28 Operational Acceptance Plan

This plan is required before P28 can be marked runtime-verified.

## Permission matrix tests

Use at least these identities in one disposable school:

- School Administrator: all permissions.
- Principal: student read + student PII read, no staff PII read by default.
- HR: staff read/create/update + staff PII read + access assignment management.
- Teacher: academic read, attendance permissions and student read; no student PII read.
- Front Office: student read/create and staff read; no student PII read.
- Active member with no role assignment: deny all module routes.
- Inactive membership: deny all tenant routes even if stale role assignments remain.

For each identity, test both allowed and forbidden GET/POST/PATCH/DELETE operations. Assert forbidden requests return 403 and do not create or mutate records.

## PII tests

- Student detail without `students.pii.read` must not include guardians, pickup contacts or documents.
- Student detail with `students.pii.read` returns permitted PII and creates `student.pii.read` audit event.
- Staff list/detail without `staff.pii.read` omits email, phone, address, emergency contact, DOB and notes.
- Staff list/detail with `staff.pii.read` returns the permitted fields and creates corresponding audit events.
- Audit event creation must be scoped to the active organization and school.

## Workflow tests

- Create student with no guardian; create student with one guardian; reject invalid guardian phone/email/relationship.
- Enroll a student using valid same-school academic year and active grade; reject cross-school and inactive grade IDs.
- Create pickup contact; reject invalid validity range and unknown student.
- Create department/designation; reject duplicate codes and malformed input.
- Create staff linked to same-school department/designation; reject foreign-school references.
- Transition staff to ON_LEAVE/SUSPENDED/TERMINATED; reject reactivation after termination/resignation through this endpoint.
- Assign teacher using active staff, same-school grade and active academic year.
- Create curriculum subject under a version/grade; reject foreign-school version or grade.
- Activate a curriculum version; verify previous active version for same school/year is retired. Run two concurrent activations to identify race behavior.
- Assign and revoke a role; verify active membership and school-scoped role constraints; verify audit rows are committed atomically.

## Database/RLS tests

Run using the production-like non-owner application role with transaction-local tenant settings. Verify cross-tenant reads/writes fail, forced RLS applies, and audit append-only triggers reject UPDATE/DELETE. Test both successful and rolled-back workflows.

## Browser E2E

Cover login, organization/school switching, permission loading, curriculum subject create/version status, student create/guardian/enrollment/pickup, staff department/designation/create/status/assignment, role create/assign/revoke, and unauthorized navigation/API responses.

## Release gate

Do not mark P28 production-ready until Prisma validation, migrations, all API and RLS tests, full typecheck/build, Vitest and Playwright pass in CI with dependency lockfile and environment versions retained.
