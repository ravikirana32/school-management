# P339 Delivery Report — Seat Reservation Lifecycle Completion

## Audit
P338 already included reservation creation, listing, manual release, expiry sweep, and seat counter updates on release/consume. P339 avoids duplicating those flows and adds expiry extension.

## Changes
- `POST /reservations/:reservationId/extend` requires `admissions.manage`, organization/school scope, active/unexpired reservation, and open offer.
- Validates ISO datetime between 5 minutes and 30 days ahead.
- Updates reservation and offer expiry together; no capacity mutation. Conditional updates guard reservation and offer state against concurrent changes; failed offer-state update throws so the transaction rolls back.
- School Admin prompts for new expiry, validates locally, calls API, reports errors, and refreshes.

## Verification
Static contract checks and TypeScript transpile diagnostics were run. No database runtime, full build, browser, mobile-device, or E2E testing is claimed.

## Open
Staff-mobile extension UI, reservation history/audit, and Cycle 2 runtime validation remain open.
