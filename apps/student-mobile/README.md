# Student Mobile App — P284

Expo-based student portal foundation. Use the verified-email student-account link flow from School Admin to link a student record to an authenticated user account. Sign in, select a linked school/student profile, and view GENERAL school announcements with read state.


## Development

- `npm install`
- `npm run start`

Set the API base URL to the school API. `http://localhost:8080` is allowed for local development; use HTTPS for deployed environments.

## P483 Daily overview
The Student Portal now shows a daily activity summary for the selected school, derived from loaded homework and announcements. It reports pending, overdue, submitted, graded, and unread notice counts. Invalid due dates are excluded from overdue classification. This is a local summary only and is not a server-side attendance or schedule dashboard. Run `pnpm verify:p483` from this package to verify the source integration.

### P487 Student Communication Center

- Consolidated school communications into a dedicated student inbox component.
- Supports all/read/unread filters, local title/body/category/priority search, unread count, newest-first ordering, empty/filter-empty states, refresh, and mark-as-read actions.
- Mark-as-read remains connected to the existing student/school-scoped inbox endpoint. This UI layer does not add a bulk-mark-read API or imply server-side notification delivery status.
- Static verifier: `pnpm verify:p487` from this app or `pnpm verify:p487` from workspace root.
