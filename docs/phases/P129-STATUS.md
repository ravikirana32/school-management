# P129 Status — Historical Accounting Migration and Opening Balances

Status: source implementation complete; runtime/database verification pending.

- Added opening-balance batch and student-level allocation models.
- Added tenant-RLS migration, composite student/batch FKs and draft-only mutation guards.
- Added independent approval and immutable posted-batch workflow.
- Added Opening Balance Equity (3000) and balanced net opening journal posting.
- Added create/list/approve/post APIs and approval permission.
- Historical transaction backfill remains unimplemented; no synthetic historical journals are created.
- Unit, API, browser and mobile test creation/execution remain deferred.
