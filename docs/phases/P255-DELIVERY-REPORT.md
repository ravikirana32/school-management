# P255 — User & Staff Management Basic Coverage

## Scope
Cycle 1 basic coverage only. Existing deep/advanced implementations were retained; this phase implemented only the missing basic staff profile edit workflow.

## Audit result
Already source-present: school-scoped staff list/search, create, department/designation creation, status lifecycle, teacher class/section assignment, employment history list/change, staff details, audit foundations and API authorization.

## Implemented in P255
- School Admin profile edit workflow (select/load/save) for first/last name, email, phone, department, designation, employment type and joining date.
- `PATCH /:organizationId/:schoolId/staff/members/:staffId` API.
- Requires `staff.update` and `staff.pii.read`; validates department/designation references belong to same organization/school.
- Emits `PROFILE_UPDATED` staff audit event with before/after basic fields.
- Staff detail API now includes department, designation, employment type and joining date for edit form initialization.
- API documentation and root/docs trackers updated.

## Not reimplemented / deferred
Account invitation delivery/self-service, private staff document UI and lifecycle polish, qualifications/experience UI, attendance/leave/shifts, workload, payroll, advanced search/export, deep authorization matrix and runtime tests remain Cycle 2 or later phases.

## Status
Cycle 1: **Partial — source implemented, runtime validation deferred**. No gap is closed without runtime evidence.

## Verification
Static source assertions and archive integrity only. Build, typecheck, API/database, browser, mobile and E2E runtime validation remain deferred per project strategy.
