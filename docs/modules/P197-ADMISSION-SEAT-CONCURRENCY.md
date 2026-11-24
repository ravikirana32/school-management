# P197 — Admission Seat Reservation Concurrency Hardening

## Implemented
- Seat reservation capacity increment now uses a conditional update matching the exact enrolled and reserved counts read within the transaction, as well as the capacity limit.
- Direct enrollment capacity increment now uses the same exact-count conditional guard to prevent stale concurrent reads from oversubscribing the section.
- Existing conflict handling returns a conflict when the conditional update loses a race.

## Deferred
- Database-level concurrency/load acceptance and runtime validation remain deferred.
- Reservation worker deployment/supervision verification remains deferred.
