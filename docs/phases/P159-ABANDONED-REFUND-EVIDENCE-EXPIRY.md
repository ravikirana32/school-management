# P159 — Abandoned Refund Evidence Expiry and Cleanup

## Delivered
- Added a scheduled sweep to the document-scan worker for refund evidence records that remain `PENDING_UPLOAD` with `STORAGE_KEY` references for more than 24 hours.
- Cleanup is bounded to 100 oldest records per sweep and runs at worker startup and every five minutes.
- Each candidate is re-read under a PostgreSQL advisory transaction lock and rechecked against status, reference type and cutoff to avoid racing upload completion/cancellation.
- The private quarantine object is deleted before a guarded `PENDING_UPLOAD` → `REJECTED` transition. If object deletion fails, the record remains retryable on the next sweep.
- Added a compound index for the scheduled status/type/age lookup.
- Emits a structured operational log when records are expired; cleanup failures log evidence ID and error class without exposing storage credentials or object contents.

## Boundaries
- `QUARANTINED` records are deliberately not expired by this job: they belong to the malware-scanning/reconciliation lifecycle and are retried by the scan worker.
- The worker must be deployed and running for scheduled cleanup to execute.
- No runtime database, Redis, S3-compatible storage, scanner, or device acceptance was run in this environment. Existing project instruction to defer unit/API/E2E test authoring and execution remains in force.

## Remaining gap
- P159-G001 remains partially implemented pending deployment and runtime verification of expiry/cancellation/completion races, storage deletion permissions, worker scheduling and monitoring/alert delivery.
