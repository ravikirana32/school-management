# P103 — Mobile Offline Security

- Mobile refresh tokens and account email are stored in Expo SecureStore; access tokens remain in memory. If refresh is temporarily unavailable, the app enters a read-only offline session rather than clearing the credential.
- Teacher timetable cache and mutation queue are namespaced by account, organization and school.
- Parent read cache is namespaced by account, organization, school and student; account school/child snapshots expire after six hours. Teacher workspace snapshots expire after 24 hours.
- Legacy teacher timetable cache keys that were not account-scoped are cleared during school discovery.
- Offline teacher attendance batches are stored in SecureStore, size-limited and scoped to the signed-in account and selected school.
- Stable idempotency keys prevent duplicate attendance writes after a lost response/retry. Server receipts are forced-RLS protected and user-scoped.
- Sync cursor responses are restricted to attendance sessions the current user can mark/manage.
- Conflicts are explicit; no last-write-wins merge is used.
- Sensitive parent consent withdrawal and other non-idempotent actions are not queued offline.
- Device-level secure storage guarantees depend on iOS/Android/Expo implementations and require device validation.
