# P563 — Parent Route Visibility, Live Status, Geofence & Notifications

## Implemented
- Parent portal endpoint `GET /:organizationId/:schoolId/parents/portal/transport`.
- Reuses parent portal scope validation: active memberships, parent permission, accepted consent invitation, verified guardian, and communications-enabled student link.
- Parent response includes linked student's active transport allocation, route/stop list, optional stop coordinates and times, allocated stop, vehicle registration/type, current-day trips, per-child attendance records and events.
- Live vehicle coordinates are returned only if school GPS is enabled, assigned driver has active consent, a current-day trip exists, ping is tied to one of the current trips, and capture time is within five minutes. No driver contact data is exposed.
- Optional stop coordinates added to `TransportStop`, with SQL latitude/longitude range and paired-coordinate checks.
- Route creation API accepts optional stop latitude/longitude; School Admin stop parser accepts comma-separated stop entries in `name|latitude|longitude` format.
- Parent Mobile Transport screen displays routes, allocated stop, vehicle, trip status/attendance, and fresh location or privacy-aware unavailable status.
- Geofence foundation helper uses Haversine distance and radius guard. Automatic geofence events/notifications are not yet wired.

## Files
- `backend/api/src/modules/parents/parent.routes.ts`
- `backend/api/prisma/schema.prisma`
- `backend/api/prisma/migrations/20261124100000_p563_transport_parent_live_status_geofence/migration.sql`
- `backend/api/src/modules/transport/transport.routes.ts`
- `backend/api/src/modules/transport/transport-geofence.ts`
- `backend/api/src/modules/transport/transport-geofence.test.ts`
- `apps/school-admin/src/TransportWorkspace.tsx`
- `apps/parent-mobile/src/TransportScreen.tsx`
- `apps/parent-mobile/App.tsx`
- `scripts/verify-p563-transport-parent-live-status-geofence.mjs`
- `P563-DELIVERY-REPORT.md`, `P563-STATUS.md`, `P563-TEST-REPORT.md`, `P563-FOCUSED-VERIFICATION.txt`

## Verification
- Focused source verifier: 17 assertions.
- Parent API, transport API, geofence helper, Admin UI, Parent Mobile screen and parent App syntax transpilation: 0 diagnostics.
- Geofence helper test: 4 assertions (same point, nearby point, distant point, invalid radius).
- Prisma validation, DB migration/runtime, full builds/typechecks, actual GPS device tests, map rendering, notification delivery and E2E remain unverified.

## Open gaps
- Native GPS/background capture, mobile consent UI, vendor provider adapters, map tiles/provider, route replay, persistent geofence events, geofence notifications, scheduled notifications, offline tracking, audit review, and full runtime/device validation.
