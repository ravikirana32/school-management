# P339 — Seat Reservation Lifecycle Completion

**Status:** Source implementation complete; runtime validation deferred to Cycle 2.

Adds an API to extend an active, unexpired seat reservation, synchronizing reservation and open-offer expiry. Expiry must be 5 minutes to 30 days ahead. School Admin exposes an Extend expiry action. Capacity counters are unchanged.

**Remaining:** staff-mobile extension UI, immutable reservation history, full build/typecheck, runtime DB/API, concurrency, browser/mobile and E2E validation.
