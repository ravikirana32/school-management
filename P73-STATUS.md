# P73 Status — Student Lifecycle and Status History

**Status: API/SCHEMA SOURCE DELIVERED; RUNTIME ACCEPTANCE PENDING**

- Added explicit student lifecycle transition rules.
- Added tenant-scoped, auditable status-history records and migration with forced RLS.
- Added permission-gated status transition and history endpoints. Admission conversion and direct enrollment now also create lifecycle history; enrollment cannot bypass the transition matrix.
- Transition uses conditional updateMany to reject concurrent stale updates; status and history/audit write in one tenant transaction.
- Terminal exit statuses set leavingDate; reactivation from INACTIVE clears it.

Not claimed: Prisma validation, migration deployment, concurrency test execution, UI integration or board-specific lifecycle approval.
