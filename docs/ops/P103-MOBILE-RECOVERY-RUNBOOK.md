# P103 Mobile Offline Recovery Runbook

## Teacher attendance
1. Select the correct school and open the attendance session while online.
2. Mark attendance. If connectivity fails during save, the app stores small batches in device SecureStore with stable idempotency keys.
3. Do not add more marks to that session while a batch is pending; sync the pending batch first.
4. Use Sync pending, reopen the app, or return it to foreground to retry eligible batches.
5. PENDING items retry with exponential backoff. CONFLICT and FAILED items require operator review.
6. For a conflict, reload the roster and compare the server state. Retry only when the original action remains valid; otherwise discard and re-enter the corrected marks through the online workflow.
7. Queue items are scoped to the signed-in account and school. Signing out does not transfer queued work to another account. SecureStore keeps the queue and account-scoped workspace snapshots; sign back in with the same account to recover them. If refresh is temporarily unavailable at app startup, the app can enter read-only offline mode and reconnect later.
8. Do not clear app data or uninstall before pending work is synced or deliberately discarded.

## Parent read-only data
- Attendance and notification pages previously fetched online are available from secure cache for a limited period.
- Offline cache is read-only. Consent withdrawal and notification state changes require connectivity.
- Sign in again with the same account to recover the matching cache namespace. Sign-out clears the active account's parent cache.
