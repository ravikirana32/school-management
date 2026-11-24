# P40 migration notes

Migration: `20261117180000_p40_report_card_templates_notifications`.

- Adds tenant-scoped `NotificationBatch`, `NotificationOutbox` and `NotificationPreference` tables.
- Applies forced PostgreSQL RLS to all three tables using the existing transaction-local organization and school settings.
- Outbox records for report-card `IN_APP` notifications and `ParentNotification` inbox rows are written in the same transaction as report-card publication.
- The current P40 implementation records the in-app delivery as `DELIVERED` once the inbox row is persisted. EMAIL/PUSH preference settings are stored, but no external provider worker or delivery claim is made.
- The migration is additive. It has not been applied or rollback-tested in this environment. Back up the database and test on a disposable database before deployment.
