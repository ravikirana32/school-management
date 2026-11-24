# P12 Attendance Security

- All endpoints require authentication and active school membership.
- Tenant and school context is set through `withTenantContext`.
- Teacher marking requires `attendance.mark` and a matching active TeacherAssignment.
- Administrative session locking and correction review use school-admin/`attendance.manage` checks.
- Student attendance reads require admin or `attendance.read`.
- RLS is enabled and forced on all P12 tables.
- Direct edits after submission are blocked; corrections are separately requested and reviewed with before/after audit data.

Open security work: verify all authorization paths under real database RLS; add row-level permission checks for every read; require entitlement on all mutations; add concurrency tests, privacy retention, export controls, and guardian visibility restrictions.
