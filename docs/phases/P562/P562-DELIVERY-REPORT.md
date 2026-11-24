# P562 Delivery Report — GPS Provider Abstraction, Consent, Retention & Configuration

## Implemented
- Tenant/school GPS configuration model and API (enabled flag, provider abstraction, retention 1–30 days, interval 15–3600 seconds).
- Generic provider identifiers: GENERIC, MANUAL, FUTURE_VENDOR_ADAPTER. No vendor-specific SDK or external tracking provider is wired.
- Per-personnel consent grant/revoke records, version and timestamps.
- Driver location POST endpoint requires active school membership, active verified linked driver, enabled config, active consent, and (when supplied) a trip assigned to that driver.
- Coordinates validated; accuracy optional; captured timestamp optional; expiresAt derived from configured retention.
- Expired records purged on ingest and history read. History requires transport.manage, is tenant-scoped and capped at 500.
- Admin GPS controls for reading config and explicitly disabling GPS. Driver mobile provides manual coordinate submission as a foundation; native device GPS permission/provider integration remains pending.

## APIs
- GET/PUT `/:organizationId/:schoolId/transport/gps/config`
- GET `.../transport/gps/consent`
- POST `.../transport/gps/consent/:personnelId` (grant/revoke)
- POST `.../transport/driver/mobile/gps/location`
- GET `.../transport/gps/location-history?personnelId=&limit=`

## Privacy notes / limitations
- GPS disabled by default. Consent is explicit and school-managed in this phase; no consent UI is yet exposed in the driver mobile app.
- Location payload uses manual coordinate fields for this foundation; device GPS provider and background tracking are not connected.
- Provider abstraction is configuration only; adapters, retry, queueing, map visualization and geofencing are future phases.
- Retention cleanup runs during ingest/history reads, not a scheduled purge job.
- Full runtime/build, Prisma, DB migration and E2E remain unverified in this environment.
