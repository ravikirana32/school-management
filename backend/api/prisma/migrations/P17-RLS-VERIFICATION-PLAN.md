# P17 RLS verification plan

1. Apply all migrations including P17 to a disposable PostgreSQL database.
2. Create users U1 and U2, organizations O1/O2 and schools S1/S2; assign U1 only to S1 and U2 only to S2.
3. Under `withIdentityContext(U1)`, verify `SchoolMembership.findMany({ userId: U1, status: ACTIVE })` returns only U1/S1. Repeat for U2.
4. Under `withIdentityContext(U1)`, attempt to read U2 membership rows; expect zero rows.
5. Under identity context, verify INSERT/UPDATE/DELETE on `SchoolMembership` is not granted by the self-read policy.
6. Under tenant context O1/S1/U1, verify existing tenant reads/writes continue to work.
7. Attempt cross-tenant reads/writes using O1/S2 and O2/S1 contexts; expect RLS rejection or zero rows.
8. Call `GET /api/v1/teacher/me/schools` for both users and verify no tenant data leaks.

This is a test plan only; it has not been executed in this phase.
