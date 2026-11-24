# P561 — Transport Pickup/Drop Attendance, Absence, Missed Stop & Handover

## Implemented
- Added `TransportTripAttendance` with tenant identifiers, trip, student, route, stop, status, timestamp, recorder, notes and handover recipient.
- Added uniqueness on `(tripId, studentId, stopId)` and indexes for tenant/trip/status and tenant/student/timestamp.
- Admin GET attendance roster validates tenant-scoped trip and returns active route allocations, stops and attendance.
- Admin POST attendance requires `transport.manage`, validates trip, route stop and active allocation, and upserts a student's status per stop.
- Mobile GET/POST endpoints authorize active school membership plus verified active driver/attendant whose route assignment matches the trip.
- Supported states: WAITING, PICKED_UP, DROPPED_OFF, ABSENT, MISSED_STOP, HANDED_OVER. `HANDED_OVER` requires a recipient name.
- Daily School Admin summary counts statuses and includes a recent-record list.
- Driver Mobile can load trip rosters and record pickup, drop, absence, missed stop and handover.

## APIs
- `GET /:organizationId/:schoolId/transport/trips/:tripId/attendance`
- `POST /:organizationId/:schoolId/transport/trips/:tripId/attendance`
- `GET /:organizationId/:schoolId/transport/attendance-summary`
- `GET /:organizationId/:schoolId/transport/driver/mobile/trips/:tripId/attendance`
- `POST /:organizationId/:schoolId/transport/driver/mobile/trips/:tripId/attendance`

## Files added/modified
- `backend/api/prisma/schema.prisma`
- `backend/api/prisma/migrations/20261124090000_p561_transport_trip_attendance_handover/migration.sql`
- `backend/api/src/modules/transport/transport.routes.ts`
- `apps/school-admin/src/TransportWorkspace.tsx`
- `apps/driver-mobile/App.tsx`
- `scripts/verify-p561-transport-attendance-handover.mjs`
- root/doc/phases copies of the master gaps, C2 progress and roadmap mirrors
- P561 phase delivery, status, test and archive verification reports

## Verification
- P561 focused assertions: 16/16 PASS
- P559 regression: 24/24 PASS
- P560 regression: 17/17 PASS
- P357 transport regression: 45/45 PASS
- API transport routes, School Admin Transport TSX, Driver Mobile TSX transpilation: 0 diagnostics
- P560 baseline ZIP manifest: 4,605 entries verified; no missing entries/hash-size failures; CRC PASS

## Known open gaps
Offline attendance queue/sync; student/guardian name display; identity-verified handover (OTP/guardian authorization/signature/photo); corrections/disputes/audit UI; guardian event notifications; live database/migration/runtime/build/device/browser/accessibility/concurrency/E2E verification.
