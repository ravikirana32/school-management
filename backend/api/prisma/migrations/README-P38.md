# P38 migration — report-card governance

Apply `20261117170000_p38_report_card_governance` after P37. It adds schema versions, report-card approval events, private PDF artifact metadata, approval fields on existing report cards, tenant composite foreign keys, tenant forced-RLS policies using `app.current_organization_id` and `app.current_school_id`, an append-only approval-event trigger and one-PDF-artifact-per-report constraint and a partial unique index allowing one active schema per school/year/grade/board.

Before deployment: run `prisma validate` and `prisma generate`; apply to a disposable PostgreSQL database first; test as a non-owner role with `app.organization_id` and `app.school_id` transaction-local settings; verify cross-tenant reads/writes are denied; test apply/rollback/reapply. No rollback script is supplied because dropping the new metadata tables/columns would destroy approval evidence and generated-artifact references. A production rollback should disable the new API routes while preserving data, not drop the tables.

The SQL references existing `School`, `AcademicYear`, `GradeLevel` and `StudentReportCard` composite keys. Confirm those constraints exist in the target database before applying.
