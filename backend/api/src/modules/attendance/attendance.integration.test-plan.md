# P13 Attendance Integration Test Plan

Not executed in this source-only phase. Required scenarios:
1. Assigned teacher can create/mark; unassigned teacher and inactive membership are denied.
2. All protected routes deny access when attendance entitlement is absent/expired.
3. Reject cross-school, wrong-year, wrong-grade, wrong-section and inactive students.
4. Reject duplicate IDs in a batch and existing attendance rows.
5. Race two session submissions; exactly one succeeds.
6. Race two correction reviews; exactly one succeeds and attendance changes at most once.
7. Forced RLS denies cross-organization and cross-school reads/writes using app DB role.
8. No direct marking after SUBMITTED or LOCKED.
9. Audit events commit/rollback with their associated mutations.
10. Apply P12/P13 migrations on clean and upgrade databases.
