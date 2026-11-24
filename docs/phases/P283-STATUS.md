# P283 Status — Teacher Portal

P283 carries forward the existing teacher mobile application (secure authentication/MFA, school discovery, assigned classes, timetable, attendance, roster, homework grading, protected attachment access and offline attendance mutation queue) and integrates school announcements into the teacher workspace.

## Delivered
- Teacher mobile announcement inbox card.
- Loads recipient-scoped GENERAL notifications from the P281 inbox API.
- Displays title, date and body with unread indicator/count.
- Tap-to-mark-read uses recipient-scoped mark-read API.
- Refresh action added; offline mode disables refresh/read actions and remains read-only.
- Existing timetable, attendance, homework, grading, attachment scan checks and offline queue preserved.

## Verification
- Teacher App TSX syntax transpilation passed.
- Static assertions for inbox API integration, unread count, read action and offline guard passed.
- Cumulative ZIP integrity and checksum verified.
- Full Expo typecheck and device/API E2E not run due dependencies unavailable.

## Open gaps
- P283-VAL01: Teacher mobile typecheck/runtime/device acceptance across notification, attendance, timetable and grading.
- P283-G001: Push/email channels and deep-link routing for announcements.
- P283-G002: Direct student accounts/inbox UI for student-targeted messages; STUDENTS audience is currently guardian proxy.
