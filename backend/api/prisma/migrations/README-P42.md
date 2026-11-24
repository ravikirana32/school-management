# P42 migration

Apply `20261117200000_p42_parent_notification_inbox` after P41. It adds a composite descending index for parent notification keyset pagination. The migration is additive and safe to reapply because it uses `IF NOT EXISTS`. Rollback is `DROP INDEX IF EXISTS "ParentNotification_recipient_created_id_desc_idx";`.

Database application and rollback were not run in this environment.
