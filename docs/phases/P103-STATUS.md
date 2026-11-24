# P103 Status — Mobile Offline-first Completion

Status: FUNCTIONAL SOURCE IMPLEMENTATION FOR ATTENDANCE OFFLINE QUEUE AND SYNC; DEVICE/RUNTIME ACCEPTANCE DEFERRED.

## Delivered source
- Added `MobileMutationReceipt` persistence with a unique tenant/school/user/idempotency-key constraint and forced RLS.
- Attendance mark API accepts an `Idempotency-Key`, hashes the request payload, persists the successful response atomically with attendance marks, and replays the original response for identical retries. Reusing a key with a different payload returns 409.
- Added a keyset-paginated attendance change feed using an opaque `(createdAt,id)` cursor. It returns only changes for classes the signed-in teacher/admin is authorized to access.
- Added a teacher-device SecureStore mutation queue scoped by account, organization and school.
- Offline attendance mark batches are split into small durable chunks and queued with stable idempotency keys.
- Queue retry uses bounded exponential backoff, with separate PENDING, CONFLICT and FAILED states; conflicts are not silently overwritten.
- Queue flush runs on workspace load, app foreground and explicit user action. Users can retry or discard failed/conflicting items.
- Teacher timetable cache is now account-scoped; legacy unscoped timetable cache entries are cleared during school discovery.
- Teacher and parent mobile apps persist the account email alongside the refresh token. If refresh fails temporarily due to network/server unavailability, the apps preserve the refresh credential and enter a read-only offline session backed by account-scoped snapshots.
- Parent attendance and notification pagination pages are cached and can be read offline; cursor values are retained inside cached page responses.
- Parent account snapshots expire after six hours; teacher workspace snapshots expire after 24 hours. Parent cache remains read-only offline. Consent withdrawal and notification mutations are not queued offline.

## API surface
- POST `/:organizationId/:schoolId/attendance/sessions/:sessionId/marks` accepts optional `Idempotency-Key` header; mobile offline queue always supplies one.
- GET `/:organizationId/:schoolId/attendance/mobile-sync?cursor=<opaque>&limit=50` returns authorized attendance audit changes, session/mark snapshots, `nextCursor`, `hasMore` and server time.

## Offline write boundaries
- Only attendance mark batches are queued in P103.
- Creating attendance sessions, opening/submitting sessions, homework grading, parent notification read actions and consent withdrawal remain online-only.
- A pending batch blocks additional marks for the same session until it is synced, avoiding duplicate/conflicting local batches.
- A 409 moves a queued operation to CONFLICT. The user must review the current roster and decide whether to retry or discard; no automatic last-write-wins behavior is used.

## Deferred by user direction
Unit tests, API integration tests, browser E2E, Expo/device E2E and formal test-case creation/execution remain deferred to later validation phases.

## Not claimed / remaining
- Prisma validation/client generation and migration execution have not been run.
- Expo iOS/Android builds and physical-device network-loss/restore/account-switch acceptance have not been run.
- Automatic network connectivity monitoring is not installed; retry is triggered by app foreground, workspace load and explicit sync. A lost response after server-side refresh-token rotation remains an unresolved P80 authentication recovery edge.
- Queue encryption relies on platform SecureStore implementation; no app-level payload encryption or cross-device queue replication exists.
- Receipt retention/cleanup policy, conflict-resolution UI beyond retry/discard, and offline support for additional write workflows remain open.
