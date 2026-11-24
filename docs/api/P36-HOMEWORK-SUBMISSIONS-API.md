# P36 homework submission API

All paths are mounted under `/api/v1`.

| Method | Path | Permission / scope | Behavior |
|---|---|---|---|
| POST | `/:org/:school/parents/portal/children/:studentId/homework/:assignmentId/submissions` | Parent portal `parent.homework.read`, active consent, linked child | Submit or replace ungraded text answer; assignment must be published |
| GET | `/:org/:school/parents/homework/:assignmentId/submissions` | Active school membership + `academics.manage` | List up to 200 submissions for the tenant-scoped assignment |
| PATCH | `/:org/:school/parents/homework/submissions/:submissionId/grade` | Active school membership + `academics.manage` | Set score/max score, teacher feedback, grader and graded timestamp |
| GET | `/:org/:school/parents/portal/notifications/unread-count` | Parent portal `parent.notifications.read`, active consent | Return unread count scoped to recipient and consented children |

A score must be non-negative and no greater than a positive max score. The database independently enforces score bounds and consistency between `GRADED` status and grader timestamp. Replacing a graded submission returns HTTP 409. Submission attachments, rubrics, reopen and history APIs are not included.
