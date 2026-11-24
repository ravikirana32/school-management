# P566 Feature Contract — Hostel Roll-call, Curfew, Attendance & Night Checks

## Roll-call
- One session is unique per organization, school, building, calendar date and session type.
- Session types: MORNING, EVENING, NIGHT.
- Resident states: PRESENT, ABSENT, LATE, ON_LEAVE, NOT_VERIFIED.
- Only active allocations in the selected building enter the roster.
- A staff note is mandatory to verify an absence.
- Session closure is rejected while any record is NOT_VERIFIED or ABSENT without verification evidence.

## Curfew
- Policies may be school-wide or building-specific.
- Policies retain effective dates, weekdays, curfew time and grace minutes.
- Late-return records preserve expected and actual return time, reason, minutes late, status and recording staff.
- Late duration is calculated after the policy grace period.
- Open late-return records are resolved only after actual return is confirmed.

## Night checks and safety
- A round is tied to a school building and scheduled time.
- Every active allocation in that building receives one unique round entry.
- Round completion is blocked while any entry remains NOT_CHECKED.
- PRESENT and NOT_IN_ROOM are explicit staff observations.
- NOT_IN_ROOM creates a VERIFYING safety task; it is not a confirmed missing-student status.
- A roll-call absence can be escalated only after the absence record has been verified.
- Safety tasks require recorded verification and a resolution statement before closure.

## Access and privacy
- Every route requires authenticated active school membership.
- Mutations require hostel.manage or School Admin access.
- Data access uses the existing organization/school tenant context.
- Audit events capture privileged state changes.
- Parent/mobile notification delivery is not part of the P566 delivered contract; it remains a tracked gap.
