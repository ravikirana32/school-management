# Teacher App

P01 Expo application shell. Run from repository root with `pnpm --filter @school-saas/teacher-mobile start` after `pnpm install`.


## P18 daily timetable
After selecting a school and loading the teacher workspace, the app requests the signed-in teacher's date-specific timetable and staff-visible calendar events. Dates are entered as `YYYY-MM-DD`; timetable periods use the school's local `HH:mm` values. The mobile view currently requires an online connection.


## P103 offline attendance
Attendance mark batches are split into small idempotent chunks and saved in SecureStore when a network/temporary server failure occurs. Use **Sync pending** or bring the app back to the foreground to retry. A pending batch blocks additional marks for that attendance session until it syncs. Conflicts and exhausted retries are shown separately; review the roster before retrying or discarding. The queue and timetable cache are scoped to account, organization and school; signing out does not transfer queued work to another account. A temporary refresh/network failure restores a read-only cached workspace; use Reconnect to refresh the session before syncing.
