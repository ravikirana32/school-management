# P355 — Parent / Student / Teacher Mobile Coverage Audit

## Scope
Audit current parent, student and teacher mobile application source for major student/guardian/teacher workflows, feature integration and basic end-to-end journey gaps. P355 is an audit and coverage phase; full test-case creation and runtime validation remain deferred to the dedicated Cycle 2 validation programme.

## Coverage inventory

### Parent Mobile — broad coverage present
- Authentication/MFA and linked school discovery.
- Children profiles and child selection.
- Attendance data and paging.
- Fees, payments and refund request activity.
- Homework, submission/resubmission and protected attachments.
- Report cards and download links.
- Notification inbox/read actions, pagination and preferences/channel readiness.
- Parent-school message threads, replies and closure.
- Health screen for consented linked children.
- Canteen menu and order/history.
- Offline cache for selected account/workflows and notification preference intent queue.

### Teacher Mobile — core teaching coverage present
- Authenticated teacher context and school selection.
- Teaching assignments, timetable and weekly timetable.
- Attendance sessions, assigned-class roster, mark save and session transitions.
- Offline timetable/roster snapshots and queued attendance mutations.
- Homework publishing/management, submissions review, grading and protected attachment access.
- Parent thread reply/closure.
- Staff mobile integrations carried forward: health, canteen, payroll/payslips and HR self-service leave.

### Student Mobile — partial coverage
- Authentication/MFA and linked student school.
- Student profile/enrollment details.
- Homework assignments and submission/resubmission.
- Announcements/inbox read state.
- Canteen menu and student ordering.
- Identified gaps: student attendance history/summary, fee balances/payment access, report cards/results, timetable, student messaging/communications, student health view and stronger offline continuity for core journeys. Availability of corresponding student APIs must be confirmed before UI work; guardian APIs cannot be reused without appropriate student-specific authorization.

## Findings
- Parent Mobile has broad core functionality, but provider readiness, push/email availability and offline-write limitations remain surfaced in UI and need runtime/device validation.
- Teacher Mobile has good attendance/homework/timetable coverage; offline queue conflict recovery, device validation and broader classroom workflows remain Cycle 2 validation targets.
- Student Mobile is materially behind Parent Mobile feature parity. Do not mark student journey coverage complete.
- P355 did not change app code; it documents the current coverage baseline and registers prioritized missing student journeys.

## Verification
- Static coverage verifier: 33 checks, 33 PASS.
- No dependency-backed builds, API runtime, E2E/regression or device testing executed.

## Open gaps
- P355-G001 OPEN: Student mobile attendance history/summary and timetable journeys.
- P355-G002 OPEN: Student fees/balance/payment and report-card/results journeys.
- P355-G003 OPEN: Student communications, health view/privacy/access policy and offline coverage.
- P355-G004 OPEN: Parent/teacher offline queue runtime conflict, synchronization and recovery testing.
- P355-G005 OPEN (Cycle 2): Complete API/UI mobile builds, E2E/regression, security, device/OS matrix and accessibility validation.
