# P111 Delivery Report

## Changed implementation

- `apps/teacher-mobile/src/auth/session.ts`
- `apps/parent-mobile/src/auth/session.ts`
- `scripts/verify-p111-session-isolation.mjs`
- root package script `verify:p111`

Both mobile clients now coordinate refresh operations using a key derived from API origin and the presented refresh token. Before persisting a rotated token, each operation checks that the stored token still matches the token it refreshed. Identity persistence is similarly guarded against an account switch while `/auth/me` is in flight. Authenticated server user IDs are stored as stable account markers.

Existing local data remains partitioned by verified email plus organization/school/student scope. Full migration of all caches and queues to immutable user IDs is explicitly not claimed.
