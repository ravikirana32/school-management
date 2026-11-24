# Teacher and Parent Mobile Applications

## Shared mobile foundations
- React Native + Expo + TypeScript.
- Separate app identities, store listings and release pipelines.
- Shared internal packages for API client, validation, localization, theme tokens and secure common components.
- Secure token storage using platform secure storage.
- Push notification registration and device revocation.
- Deep links with authorization checks.
- Offline queue only for explicitly approved workflows.
- Accessibility, localization and low-bandwidth behavior.
- Analytics must avoid collecting unnecessary child data.

## Teacher App navigation
Home, My Schools, Classes, Attendance, Timetable, Homework, Exams, Students, Messages, Leave, Notifications, Profile.

### Teacher workflows
- View authorized school assignments.
- View timetable and class rosters.
- Mark daily and period attendance.
- Save attendance offline and synchronize safely.
- Assign homework and attach files.
- Review submissions and provide feedback.
- Enter marks and grades within approval rules.
- Update lesson and syllabus progress.
- Communicate with authorized parents.
- Apply for leave.
- Receive schedule and school notifications.

## Parent App navigation
Home, My Children, Attendance, Homework, Timetable, Fees, Results, Transport, Messages, Documents, Profile.

### Parent workflows
- One account for multiple authorized children.
- Children may attend different schools and organizations.
- Switch child/school context without separate login.
- View attendance, homework, timetable, examination results and report cards.
- Pay fees and download receipts.
- View bus location and trip alerts where enabled.
- Submit leave requests.
- Book parent-teacher meetings.
- Read announcements and messages.
- Submit complaints and access emergency contacts.

## Offline and synchronization requirements
P00 does not finalize offline data policy. P16 must define:
- Which data may be cached and for how long.
- Encryption and device logout/revocation behavior.
- Offline attendance queue schema.
- Idempotency keys and duplicate submission prevention.
- Server-authoritative timestamps and conflict handling.
- Permission revalidation at synchronization.
- Handling of academic-session changes and revoked school access.
- User-visible sync state and failed-item recovery.

## Child safety and privacy
Minimize locally stored child data. Do not expose other students' information in class lists or notifications beyond the teacher's authorized purpose. Parent-child access must be validated server-side for every request.


## Parent mobile app — P31
- Parent invitation deep-link handling, token preview and exact versioned consent notice display before acceptance.
- Existing account password proof/new account creation, login, refresh-token rotation and logout; refresh token is stored with Expo SecureStore.
- Authenticated school picker, linked-child list, published attendance history and school-scoped consent withdrawal.
- Parent endpoints filter by accepted non-withdrawn invitation, verified active guardian, active school membership, PARENT role permission and communication-enabled StudentGuardian link.
- Runtime Expo build, secure-store device acceptance and mobile E2E remain pending.

## P100 Parent Mobile student lifecycle visibility

The parent portal children endpoint returns the current student status only for students linked through an active, consented guardian relationship. Parent Mobile displays that current status and exposes a refresh action to reload student/enrollment details. Internal status-transition reasons, staff actor IDs and lifecycle audit data remain School Admin-only. Local Expo/device acceptance is deferred to the consolidated validation phase.
