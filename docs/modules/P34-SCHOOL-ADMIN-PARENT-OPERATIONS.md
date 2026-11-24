# P34 — School Admin Parent Operations

## Scope
P34 connects School Admin workflows for fees, manual payment reconciliation, homework, report cards and in-app parent notifications to the P33 tenant-scoped APIs.

## Workspace
`apps/school-admin/src/ParentOperationsWorkspace.tsx` provides four permission-gated areas:

- Fees & payments (`fees.manage`): create a student fee charge, save as draft or publish, inspect charges and recent payment records, and manually record a payment against an eligible charge.
- Homework (`academics.manage`): create student-specific assignments with subject, description and due date; save draft or publish.
- Report cards (`reports.manage`): create a student report card for the selected academic year and term, enter a JSON result summary and remarks, save draft or publish.
- Parent notifications (`parent.notifications.manage`): create a school notification for a selected student. The backend derives recipients from verified guardians with accepted, non-withdrawn consent and active communication links.

The workspace uses the shared School Admin session, organization/school context and authenticated request helper. It does not persist credentials in browser storage.

## Publication behavior
Draft fee charges, homework and report cards are visible only to school operators. Publish endpoints perform a tenant-scoped lookup, permit only DRAFT-to-PUBLISHED transition, stamp `publishedAt` and write an audit event. Parent read APIs continue to filter published records.

## Explicit boundaries
- Manual payment recording is reconciliation only; it does not initiate a payment gateway transaction.
- Homework submission, attachments, teacher grading and feedback are not included.
- Report-card result summaries receive a generic non-empty/100-key structural validation. Templates, board-specific grading validation, approval workflows and PDF generation are not included.
- Notifications are in-app records; push/email transport, receipts and preferences are not included.
- School-side list APIs return at most 100 rows and need cursor pagination for larger schools.

## Verification boundary
Source syntax and static assertions were checked. Prisma validation, PostgreSQL/RLS, API integration, Vitest, full builds and browser/mobile E2E were not run. Runtime acceptance is not verified.
