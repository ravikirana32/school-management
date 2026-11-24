# P41 migration notes

- Adds a random 128-bit hex verification code to each report-card PDF artifact and backfills existing artifacts before enforcing NOT NULL/unique.
- Adds read-only public verification RLS policies on the four required report-card lookup tables. The public handler sets only `app.report_card_verification=true`, validates a strict 32-character hex code and returns school/year/term/issue date only.
- Adds a dedicated `app.notification_worker=true` policy for the notification outbox and read-only consent/preference tables. Run the worker with a dedicated database role; do not grant it table ownership or BYPASSRLS.
- Policies are additive/permissive in PostgreSQL; existing tenant policies remain in force for ordinary application sessions.
- Apply with `pnpm --filter @school-saas/api prisma:deploy` after regenerating the Prisma client. Validate rollback on a disposable database before production. Rollback: drop the P41 policies, drop the verification unique index and column. Do not roll back after issuing new codes unless PDFs are regenerated.
