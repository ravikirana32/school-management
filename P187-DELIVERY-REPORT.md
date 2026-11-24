# P187 Delivery Report — Admissions Seat Reservation Management

## Completed source work
- Added school-scoped reservation listing API: `GET /:organizationId/:schoolId/admissions/reservations`, supporting optional `status` filter, sorted and capped to 250 rows.
- Added manual release endpoint requiring `admissions.manage` and a release reason. Only ACTIVE reservations linked to OFFERED offers are releasable; state is conditionally changed to avoid duplicate release, capacity decrement is guarded by positive reserved seats, and open offer is marked WITHDRAWN.
- School Admin Admissions Workspace now loads reservations, shows reservation/application/offer/capacity IDs, status and expiry, supports manual release with reason, and invokes the existing expiry-sweep endpoint.
- Added P187 module documentation and updated both gap-register copies.

## Deferred verification
- Dependencies are not installed in this extracted workspace, so build/typecheck and automated tests were not run.
- API integration/runtime, database migration and concurrency acceptance remain deferred by project instruction.

## Remaining Admissions reservation gaps
- Automatic scheduled expiry sweep is not configured; staff can invoke the sweep from the UI.
- Prisma relation fields are not declared on AdmissionSeatReservation, so the list shows linked IDs rather than joined display names.
- Concurrency/runtime acceptance remains open.
