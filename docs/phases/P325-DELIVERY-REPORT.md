# P325 — Student Portal Homework Visibility

## Delivered
- Added authenticated student-only `GET /students/me/:organizationId/:schoolId/homework` endpoint.
- Endpoint requires an active linked student account for the requesting user, confirms active school, and returns only that linked student's published assignments.
- Includes assignment title, subject, description, due date, attachment metadata, published timestamp, and associated submission status/answer/score/feedback/graded timestamp and attachment metadata.
- Student mobile portal loads homework after school discovery and on school switching; added refresh control and homework cards with due date, submission status, scores, and teacher feedback.
- Does not add homework submission/edit actions in this phase.

## Verification
- Static source assertions: 10/10.
- TypeScript transpilation syntax diagnostics: 0 for student-mobile App.tsx and student.routes.ts.
- API/database/runtime/browser/device tests and full build: not run.

## Limitations / open gaps
- Student app currently discovers the first linked school automatically; multi-school UX remains a follow-up.
- Attachment metadata is displayed/returned but student download/open handling is not implemented here.
- Student homework endpoint runtime authorization and query behavior are not tested against a live database.
- Offline caching of homework not added.
