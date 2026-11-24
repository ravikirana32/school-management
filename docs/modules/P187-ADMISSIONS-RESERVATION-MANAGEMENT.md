# P187 — Admissions Seat Reservation Management

## Scope
Manage existing admission seat reservations from the School Admin admissions workspace and allow staff to release a reservation with a required reason. Expose tenant/school-scoped reservation listing and expiry sweep.

## Source changes
- `GET /:organizationId/:schoolId/admissions/reservations` lists school-scoped reservations (optionally filtered by status), newest/expiry ordered and capped at 250.
- `POST /:organizationId/:schoolId/admissions/reservations/:reservationId/release` requires `admissions.manage`, validates a release reason, conditionally changes ACTIVE to RELEASED, decrements reserved capacity only if positive, and marks an open offer WITHDRAWN.
- School Admin UI lists reservation IDs/application IDs/offer IDs/section capacity IDs, expiry/status, manual release action, and expiry-sweep action.
- Existing expiry endpoint remains available and is invoked from the UI. A recurring scheduler is not configured in this phase.

## Verification
- P186 cumulative archive ZIP integrity verified before extraction.
- Source edits applied and cumulative ZIP integrity verified.
- Build/typecheck, migration, API tests and runtime acceptance are deferred per project instruction.

## Remaining
- Automatic scheduled expiry processing and concurrency/runtime acceptance remain open.
- Reservation record is currently displayed with its linked IDs because Prisma relation fields are not declared on this model.
