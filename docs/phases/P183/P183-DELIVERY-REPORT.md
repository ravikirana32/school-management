# P183 — Admissions Offer Seat Reservations

## Implemented (source)
- Added `AdmissionSeatReservation` schema and migration.
- Offer creation can optionally reserve a seat in a configured section. Reservation increments `reservedSeats` only if capacity remains after enrolled and reserved seats.
- Reservation records are scoped to organization/school/application/offer and store expiry.
- Declined offers release an active reservation and decrement the section reserved-seat count.
- Added staff endpoint `POST /reservations/release-expired` to expire reservations and offers and release reserved capacity idempotently.
- Conversion to enrollment consumes a matching active reservation by moving one seat from reserved to enrolled; otherwise it checks capacity against enrolled + reserved.
- Availability API already exposes available seats as capacity minus enrolled and reserved.

## Open/limitations
- Reservation creation is optional when offer payload includes `sectionName`; offers without section selection remain unreserved.
- Expired-offer cleanup currently requires the staff endpoint to be invoked; scheduler/automation is not wired.
- Reservations are not yet exposed as a dedicated web/mobile reservation management workspace.
- Concurrency and rollback behavior require runtime acceptance.

## Verification
- Source edits and schema/migration files inspected.
- No build, migration execution, tests, or runtime validation performed (deferred by project instruction).
