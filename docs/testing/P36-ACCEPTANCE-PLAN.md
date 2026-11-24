# P36 acceptance plan

1. Validate Prisma schema and generate client; apply P36 migration after P35 using a non-owner role.
2. Verify RLS blocks missing/wrong org and school context for SELECT/INSERT/UPDATE.
3. Verify composite FKs reject an assignment/student from another tenant or school.
4. Verify parent without active consent or linked child cannot submit or read; verify draft/cancelled homework cannot accept a submission.
5. Verify first submission, replacement while ungraded, duplicate concurrent submission, graded resubmission conflict and score boundaries.
6. Verify teacher/operator permission, tenant scoping, grading audit event and parent feedback visibility.
7. Verify unread count for no consent, one/multiple children, read/unread rows and another user's notifications.
8. Run Vitest, full API/web typecheck and builds, Playwright parent/operator workflows, and Expo parent app tests.
9. Add k6 and EXPLAIN evidence for parent notifications and operator list queries before closing performance gaps.

Current phase verification is source/static only; see phase report and artifact manifest.
