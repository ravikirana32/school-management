# P37 homework API

All paths are under `/api/v1/:organizationId/:schoolId` and require authenticated school membership.

| Method | Path | Purpose |
|---|---|---|
| POST | `/documents/homework/:submissionId/upload` | Parent starts private attachment upload; `displayName`, `mimeType` (`application/pdf`, `image/jpeg`, `image/png`) and `sizeBytes` required |
| POST | `/documents/:documentId/complete` | Complete upload with `{ "kind": "homework" }`; object metadata is checked before quarantine |
| GET | `/documents/:documentId/download?kind=homework` | Short-lived signed download URL, only after CLEAN scan and consent/assignment authorization |
| POST | `/internal/documents/:documentId/scan-result` | Existing HMAC scanner callback; `kind` now also accepts `homework` |
| GET | `/parents/homework` | Bounded operator/teacher homework list; linked teachers are restricted to assigned class students |
| GET | `/parents/homework/:assignmentId/submissions` | Assigned teacher submission list, including attachment metadata |
| PATCH | `/parents/homework/submissions/:submissionId/grade` | Grade with `score`, `maxScore`, optional `teacherFeedback` and up to 30 rubric criteria |
| GET | `/parents/homework/submissions/:submissionId/history` | Append-only grading/reopen event history |
| POST | `/parents/homework/submissions/:submissionId/reopen` | Reopen a graded submission; requires a reason |

Attachment upload returns a presigned POST form; clients must upload to the returned URL/fields, then call completion. The document remains unavailable until the scanner callback returns CLEAN. Signed download URLs expire after 60 seconds. No raw storage credentials are returned.

Teacher list/read/history endpoints accept the dedicated `homework.read` permission; grading/reopen accepts `homework.grade`. The SCHOOL_TEACHER seed role receives both. School operators with `academics.manage` retain the operator path. Linked teacher accounts are additionally constrained to active teacher assignments matching the student's active academic year, grade and section.
