# P453 — Teacher Mobile Notification Inbox Pagination

## Status
Implemented at source level against the P452 cumulative archive. The teacher mobile inbox now consumes server pagination metadata and supports continuation pages.

## Delivered
- Inbox request helper can optionally return the API response envelope without changing existing callers.
- Initial teacher announcement load captures the cursor, has-more state, and server unread count.
- Added a guarded Load more action that requests the next cursor page.
- Appended notifications without duplicate IDs and retained the existing GENERAL announcement display filter.
- Read-one action updates local read state and decrements the unread badge only when the item was previously unread.
- Refresh reloads the first page and resets continuation metadata.
- Offline session and in-flight pagination disable the Load more action.
- Added focused source verifier and `verify:p453` package script.

## Verification
- P453 focused source verifier: 11/11 PASS.
- P452 focused source verifier: 10/10 PASS.
- Verifier Node syntax: PASS.
- TypeScript/Expo build, device E2E, API runtime and live database: NOT RUN in this environment.

## Limitations / follow-up
- The page cursor advances across the complete inbox; the teacher UI still filters to category `GENERAL`, so a page containing only other categories may render no announcements while still advancing.
- Runtime response compatibility, session refresh, school switching and device UI behavior need acceptance testing.
