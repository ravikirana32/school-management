# P12 — Student Attendance Foundation

## Scope
Introduces date/class attendance sessions, bulk marking, forward-only session lifecycle, attendance records, correction requests, administrative review, and audit events.

## Session workflow
`DRAFT → OPEN → SUBMITTED → LOCKED`. Marking is accepted only while OPEN. Submission requires at least one mark. Submitted/locked records cannot be edited directly; corrections require a separate request and administrator review.

## Access
- Active school membership is required.
- School administrators (existing admin guard) or holders of `attendance.manage` can manage sessions.
- Teachers require `attendance.mark` and an active TeacherAssignment matching grade and, when supplied, section.
- Read endpoints require administrative access or `attendance.read`.
- Attendance entitlement is checked before session creation. Other mutation endpoints are expected to be guarded by the same entitlement in the next hardening pass; see open gaps.

## Enrollment validation
Every mark must match an active StudentEnrollment for the session's organization, school, academic year, grade and section, and an ACTIVE student. A unique session/student index prevents duplicate marks.

## Limitations
- No guardian-facing attendance view, notification delivery, biometric/device ingestion, import workflow, timetable-period attendance, or attendance analytics.
- No attendance policy integration (late thresholds, half-day rules, working days) yet.
- The School Admin preview component is local-only and not mounted to the live navigation.
- Database/API runtime verification has not been performed.
