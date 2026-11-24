# P188 — Automatic Admission Seat Reservation Expiry

## Delivered (source)
- Added `backend/api/src/workers/admission-reservation-expiry-worker.ts`.
- Worker runs an initial sweep on startup and repeats on a configurable interval (default 60 seconds; `ADMISSION_RESERVATION_EXPIRY_INTERVAL_MS`).
- Processes batches of up to 100 expired ACTIVE reservations.
- Uses a conditional ACTIVE + expiry update within a transaction so concurrent worker instances and repeat sweeps do not release the same reservation twice.
- Decrements reserved capacity only when the reservation claim succeeds and capacity reserved count is positive.
- Marks matching still-OFFERED offers EXPIRED only when their offer expiry is also due.
- Added API package script `worker:admission-reservation-expiry`.
- Worker logs successful release counts and failures without leaking sensitive payloads.

## Operational startup
Run the API worker separately from the API process:
`npm run worker:admission-reservation-expiry --workspace @school-saas/api`

Deploy at least one worker instance. Multiple instances are safe for concurrent execution due to conditional state transitions.

## Verification
- P187 cumulative ZIP integrity verified before extraction.
- Source changes and package script applied.
- Build/typecheck/tests/runtime acceptance are deferred per project instruction.

## Remaining admissions gaps
- Worker deployment/process supervision and runtime concurrency verification.
- Seat reservation UI/API acceptance.
- Public admission portal completeness and anti-abuse/verification controls.
- Guardian identity/account-link review flows.
- Admission payment, receipts and reconciliation.
- Final Admissions gap reconciliation.
