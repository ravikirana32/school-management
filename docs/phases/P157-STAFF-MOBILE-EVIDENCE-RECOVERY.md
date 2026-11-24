# P157 — Staff Mobile Evidence Upload Recovery

## Delivered
- Added server-enforced tenant/staff-scoped idempotency for evidence upload initiation using a PostgreSQL transaction advisory lock and a unique database index.
- Persisted idempotency key and SHA-256 request fingerprint on each evidence record.
- Replays with the same key and same refund/note/label/MIME/size return the same evidence record and a newly generated presigned upload form, allowing recovery after URL expiry.
- Reuse of a key with different request data or a different refund/note returns HTTP 409; already-progressed evidence cannot be overwritten by a replay.
- Staff Mobile persists pending upload metadata in Expo SecureStore, re-initiates using the same key before each retry, and scopes pending work to its original organization/school/refund/note.
- Completion retries once after access-token refresh. Pending metadata is cleared only after successful completion.

## Verification limits
- `node scripts/verify-p157-staff-mobile-evidence-recovery.mjs` — 12/12 source checks passed; archive integrity checked separately. PostgreSQL migration, Prisma generation, API compilation, storage URL expiry, Expo typecheck/build, and iOS/Android runtime are not executed here.
- Pending metadata is stored in SecureStore; the picked file URI may still become unavailable if the operating system evicts the app cache. In that case the user must select the source file again; server idempotency prevents duplicate evidence creation.
- Unit/API/E2E test authoring and execution remain deferred by project instruction.

## Gap
- P157-G001 remains PARTIALLY_IMPLEMENTED pending database/API/mobile/runtime acceptance and durable source-file recovery when the OS evicts cache files.
