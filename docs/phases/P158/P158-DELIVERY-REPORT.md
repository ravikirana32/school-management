# P158 Delivery Report — Durable Staff Mobile Evidence Recovery

## Delivered
- Added `expo-file-system` and copy-to-app-documents behavior so selected evidence is retained outside the transient document-picker cache.
- Persisted the durable local URI and creation timestamp with the existing SecureStore pending-upload metadata.
- Added source-file existence validation before retry/upload; missing local content now produces an actionable recovery message instead of repeatedly requesting a doomed transfer.
- Removes the app-owned local copy after successful completion.
- Added a tenant-, school-, refund-, note-, uploader- and `PENDING_UPLOAD`-scoped cancellation API. Cancellation deletes the quarantine object and evidence row and writes an audit event.
- Added Staff Mobile cancellation UI and local-copy cleanup.

## Verification boundary
- Source-level checks and archive integrity are performed for this phase.
- Expo dependency installation, TypeScript build, PostgreSQL migration/runtime, object-storage deletion, scanner integration and iOS/Android device behavior have not been executed here.

## Remaining
- P158-G001 remains PARTIALLY_IMPLEMENTED: server-side scheduled expiry/reconciliation for abandoned `PENDING_UPLOAD` records and objects is not yet implemented; runtime/device acceptance is pending.
