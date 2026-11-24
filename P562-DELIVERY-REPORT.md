# P562 Delivery Report — Transport GPS Provider Abstraction, Consent, Retention & Configuration

## Implemented
- Prisma models `TransportGpsConfig`, `TransportGpsConsent`, `TransportLocationPing` and migration.
- Tenant/school config: enabled flag, provider (`GENERIC`, `MANUAL`, `FUTURE_VENDOR_ADAPTER`), retention 1–30 days, interval 15–3600 seconds.
- Consent grant/revoke records with version and grant/revoke timestamps.
- GPS capture endpoint: linked verified active driver only; active school membership; config enabled; explicit consent; optional trip must belong to that driver's route; coordinate range validation.
- Expiry is derived from bounded retention; expired records purged during location ingest and history reads.
- Admin history access requires `transport.manage`, tenant scope and a 500-row maximum.
- Admin workspace config read, enable/disable, consent-list refresh and personnel grant/revoke actions.
- Driver mobile manual coordinate fields and submission foundation. This is not a native GPS implementation.

## API routes
- GET/PUT `/:organizationId/:schoolId/transport/gps/config`
- GET `.../transport/gps/consent`
- POST `.../transport/gps/consent/:personnelId`
- POST `.../transport/driver/mobile/gps/location`
- GET `.../transport/gps/location-history?personnelId=&limit=`

## Files
- `backend/api/prisma/schema.prisma` — models.
- `backend/api/prisma/migrations/20261124093000_p562_transport_gps_consent_retention/migration.sql` — SQL tables/indexes.
- `backend/api/src/modules/transport/transport.routes.ts` — tenant/permission/consent checks, configuration, capture, history and purge.
- `apps/school-admin/src/TransportWorkspace.tsx` — GPS configuration and consent controls.
- `apps/driver-mobile/App.tsx` — manual coordinate submission foundation.
- `scripts/verify-p562-transport-gps-consent-retention.mjs` — static verifier.
- `docs/phases/P562/` — reports, evidence and synchronized mirrors.

## Verification
P562 19/19; P561 16/16; P560 17/17; P559 24/24; P357 45/45 PASS. Syntax transpilation for API/Admin/Driver Mobile has 0 diagnostics. Full Prisma validation/generation, migration execution, package builds/typechecks, runtime API/database, device GPS, browser/mobile E2E, accessibility, security, concurrency and scheduled retention are not run.

## Open gaps
Native GPS SDK/device permission and background capture; consent self-service UI and consent evidence audit; scheduled purge; location throttling/offline retries; map/geofence/alerts; full integration and E2E.
