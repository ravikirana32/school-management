# P123 — Student PII, Guardian and Fee Authorization

Status: source remediation complete; runtime acceptance pending.

## Implemented
- Student detail responses now use an explicit field allowlist. Date of birth, demographic attributes, contact details, address and internal notes are returned only when `students.pii.read` is granted.
- Enrollment responses use an explicit field selection rather than returning every scalar field.
- Users with the built-in `SCHOOL_TEACHER` role are restricted to currently enrolled students in their active academic-year/grade/section assignments when reading student detail and guardian information.
- Student-document upload initiation, upload completion and download apply the same teacher assignment boundary.
- Existing fee-list endpoint requires the explicit `fees.read` permission. The seeded `SCHOOL_TEACHER` role does not receive `fees.read`; no teacher fee access is granted by this phase.
- Parent fee access remains separately bound to accepted consent and `parent.fees.read`.

## Limitations
- Custom roles with fee permissions are governed by explicit permission assignment; policy review of custom role composition remains open.
- Student-document uploads and metadata mutation remain controlled by `students.update` and `students.pii.read`; broader document lifecycle review remains open.
- Runtime API/database, cross-tenant, and role-combination validation has not been executed.
- Unit, API, browser and mobile test creation/execution remain deferred as previously requested.
