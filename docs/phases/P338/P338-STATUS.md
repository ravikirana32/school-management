# P338 Status — Admission Offer Lifecycle

**Status:** Source implementation completed; portal UI and runtime validation remain open.

Added public offer listing and applicant response endpoints protected by the application's private tracking token. Accept/decline responses are school/org/application scoped and use a transaction lock with state rechecks. Offer expiry handling persists EXPIRED state and releases any active seat reservation with capacity decrement. Applicant response is recorded in admission stage history and applicant notification.

Cycle 2 will cover full runtime/build/typecheck, database concurrency, browser/mobile UX and E2E verification.
