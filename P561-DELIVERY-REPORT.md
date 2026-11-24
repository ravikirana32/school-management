# P561 Delivery Report — Transport Pickup/Drop Attendance, Absence, Missed Stop & Handover

**Status: COMPLETE** (source implementation and focused verification).

## Implementation details
- New `TransportTripAttendance` persistence model with tenant IDs, trip/student/route/stop IDs, attendance status, record timestamp/user, notes and handover recipient.
- Unique trip/student/stop key and indexes for tenant trip/status and student time history.
- Admin roster API and attendance write API. Admin writes require `transport.manage`; tenant trip, route stop and active student allocation are validated. Upsert prevents duplicate attendance records for the same trip/student/stop.
- Verified active driver/attendant mobile roster and write APIs validate school membership and personnel-to-route assignment.
- Attendance status options: WAITING, PICKED_UP, DROPPED_OFF, ABSENT, MISSED_STOP, HANDED_OVER. Handover requires recipient text.
- Driver mobile can load trip attendance roster and update pickup/drop, absence, missed-stop and handover status.
- School Admin Transport workspace shows daily status counts and refresh action.

## API endpoints
- `GET /:organizationId/:schoolId/transport/trips/:tripId/attendance`
- `POST /:organizationId/:schoolId/transport/trips/:tripId/attendance`
- `GET /:organizationId/:schoolId/transport/attendance-summary`
- `GET /:organizationId/:schoolId/transport/driver/mobile/trips/:tripId/attendance`
- `POST /:organizationId/:schoolId/transport/driver/mobile/trips/:tripId/attendance`

## Files
- `backend/api/prisma/schema.prisma` — attendance model
- `backend/api/prisma/migrations/20261124090000_p561_transport_trip_attendance_handover/migration.sql` — SQL migration
- `backend/api/src/modules/transport/transport.routes.ts` — attendance API and mobile assignment authorization
- `apps/school-admin/src/TransportWorkspace.tsx` — daily attendance summary UI
- `apps/driver-mobile/App.tsx` — mobile attendance roster/status actions
- `scripts/verify-p561-transport-attendance-handover.mjs` — focused verifier
- `docs/phases/P561/*` — phase specification and reports
- `MASTER-OPEN-GAPS-REGISTER.md`, `C2-10-PROGRESS.md`, `C2-10-ROADMAP.md`, `CHANGELOG.md` and their mirror copies

## Verification results
- P561 focused verifier: **16/16 PASS**
- P559 personnel regression: **24/24 PASS**
- P560 capacity regression: **17/17 PASS**
- P357 transport regression: **45/45 PASS**
- TypeScript/TSX transpilation (API, Admin, Driver Mobile): **0 diagnostics**
- P560 baseline archive manifest: **4,605 files validated; 0 missing/hash-size failures; ZIP CRC PASS**
- P561 cumulative archive: **4,615 entries; 4,613 manifest files; 0 missing/hash failures; 0 duplicates; CRC PASS**

## Limitations / gaps kept open
Offline queue/sync, student/guardian name lookup, identity-verified handover (OTP/authorized guardian/signature/photo), attendance correction/dispute/audit UI, guardian event notifications, and full runtime/build/typecheck/device/browser/accessibility/concurrency/E2E acceptance remain OPEN.

## C2-10 progress and next phase
**24/34 (70.6%) complete; 10 remaining.** Next: **P562 — GPS provider abstraction, consent, retention and configuration**.
