# P43 migration

Apply `20261117210000_p43_brand_assets_templates_outbox_leases` after P42.

The migration adds notification outbox lease owner/expiry fields and backfills legacy PROCESSING rows as immediately expired; creates tenant-scoped `SchoolBrandAsset` and `ReportCardTemplateVersion` tables with forced RLS; adds scanner-only policies for school logo assets; enforces one active template per school/key with a partial unique index; and prevents edits to activated template content.

Prisma validation, migration apply/rollback/reapply and PostgreSQL RLS/concurrency tests have not been run in this artifact-generation environment. Rollback should be tested on a disposable database before production; do not manually delete the migration record.
