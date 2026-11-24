# P36 — Homework submission and grading

## Delivered source scope

- A tenant-scoped `HomeworkSubmission` record links one published homework assignment to its student, with a unique assignment/student constraint.
- A linked parent/guardian with active portal access and `parent.homework.read` may submit or replace an ungraded text answer on behalf of that child.
- A submission can be `SUBMITTED`, `RESUBMITTED` or `GRADED`. Grading requires `academics.manage`, validates score against max score, records grader/time, and stores teacher feedback.
- The parent homework read response includes the linked child's submission and only exposes score/feedback once the teacher has graded it (ungraded submission values are visible to the same parent account).
- A school operator with `academics.manage` can list submissions for one tenant-scoped assignment.
- Database migration adds composite tenant foreign keys, score/state checks, unique constraint, indexes and forced RLS.

## Deliberate limits

- This iteration supports text answers only. Homework submission attachment upload is not wired to the private S3/scanner pipeline; do not put object keys or file URLs in `answerText`.
- No rubric criteria, per-question marking, teacher mobile UI, offline submission queue, reopen workflow or submission history/version table.
- `academics.manage` is the current permission gate. Teacher assignment/class/subject-specific row filtering must be added before granting this permission broadly to teaching staff; until then grant it narrowly.
- Parent submission is on behalf of a linked child; no standalone student identity/login is assumed.

## API

- `POST /api/v1/:organizationId/:schoolId/parents/portal/children/:studentId/homework/:assignmentId/submissions` — parent submits text answer.
- `GET /api/v1/:organizationId/:schoolId/parents/homework/:assignmentId/submissions` — operator lists submissions.
- `PATCH /api/v1/:organizationId/:schoolId/parents/homework/submissions/:submissionId/grade` — operator grades and adds feedback.
- Parent homework GET now includes a `submission` field per published assignment.

All endpoints require active tenant membership/portal consent and the documented permission checks. Parent read access uses the existing verified guardian relationship and consent guard.
