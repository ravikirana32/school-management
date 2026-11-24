# P105 PostgreSQL Backup and Restore

- Logical backup format: `pg_dump --format=custom --no-owner --no-acl`.
- Encryption: age recipient key; private identity is not mounted into routine backup containers.
- Integrity: SHA-256 sidecar plus JSON manifest.
- Retention: `BACKUP_RETENTION_DAYS`, default 30; pruning occurs only after a new encrypted backup succeeds.
- Restore: verify sidecar, decrypt to a protected temporary directory and run `pg_restore --clean --if-exists --no-owner --no-acl --exit-on-error --single-transaction`.
- Restore requires `ALLOW_DESTRUCTIVE_RESTORE=YES`.
- Backup schedule is provided as a host cron example; it is not automatically scheduled by Compose.
- Backups remain in a local named volume until operators copy them off-host/off-region.
- WAL archiving, PITR, cross-region replication, automatic restore drills and measured RPO/RTO are not implemented in P105.
