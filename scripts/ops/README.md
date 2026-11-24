# Production operations scripts

- `init-production-secrets.sh`: create first-run secret files and an age backup identity. It refuses to overwrite existing secrets.
- `backup-postgres.mjs`: create an encrypted PostgreSQL custom-format backup, SHA-256 sidecar and manifest; prune local backups older than `BACKUP_RETENTION_DAYS`.
- `restore-postgres.mjs`: verify the checksum, decrypt and restore only with `ALLOW_DESTRUCTIVE_RESTORE=YES`.
- `deploy-production.sh`: pull images, take a pre-deploy backup, apply migrations, start services and poll the public readiness URL.
- `backup-cron.example`: example host cron schedule; it must be installed and monitored by the operator.

Backups in the named Docker volume are encrypted at rest. Copy them to a separate off-host/off-region storage target and retain the age identity offline; this P105 baseline does not itself guarantee offsite replication or point-in-time recovery.
