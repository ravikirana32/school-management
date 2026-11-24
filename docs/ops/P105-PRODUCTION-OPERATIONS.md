# P105 Production Operations Runbook

## 1. First-time setup
1. Copy `.env.prod.example` to `.env.prod`; replace every domain, registry, bucket and webhook placeholder.
2. Run `SECRETS_DIR=./secrets bash scripts/ops/init-production-secrets.sh`.
3. Copy the printed age recipient into `.env.prod` as `AGE_RECIPIENT`.
4. Obtain a TLS certificate covering the API, school admin, organization admin, platform admin and parent portal hostnames. Place `fullchain.pem` and `privkey.pem` under the configured `TLS_CERT_DIR`. The Nginx unprivileged container runs as UID/GID 101; grant that identity read access to the private key (for example owner/group 101 with mode 0640) while keeping the directory restricted.
5. Run `node scripts/ops/check-production-env.mjs`; it prints no secret values.
6. Restore the authentic `pnpm-lock.yaml` before attempting builds.

## 2. Image build and deployment
- CI/release workflows require a committed lockfile and frozen pnpm install.
- Configure GHCR login on the production host before deployment.
- Configure GitHub `production` environment approval and secrets: `PRODUCTION_SSH_HOST`, `PRODUCTION_SSH_USER`, `PRODUCTION_SSH_PRIVATE_KEY`, `PRODUCTION_SSH_KNOWN_HOSTS`, `PRODUCTION_DEPLOY_DIR`, `PRODUCTION_HEALTH_URL`.
- Configure repository variable `VITE_API_BASE_URL`.
- Run `IMAGE_TAG=<immutable-tag> HEALTH_URL=https://api.example.org/health/ready bash scripts/ops/deploy-production.sh`.
- Deployment takes a pre-migration encrypted backup, applies migrations and polls readiness. It does not automatically roll back a failed migration.

## 3. Backup schedule
- `docker compose --env-file .env.prod -f docker-compose.prod.yml --profile ops run --rm backup-postgres`
- Install `scripts/ops/backup-cron.example` in the deployment user's crontab.
- Backups use `pg_dump -Fc`, age public-key encryption, SHA-256 sidecars, JSON manifests and retention pruning.
- Keep the age identity private and offline. The backup container does not receive the private identity.
- Copy encrypted backup, `.sha256` and `.manifest.json` to an independent off-host/off-region storage target. P105 does not implement offsite replication or WAL/PITR.

## 4. Restore drill
1. Restore an encrypted backup into an isolated PostgreSQL instance, not production.
2. Mount the age identity only into the one-off restore service.
3. Run `docker compose --env-file .env.prod -f docker-compose.prod.yml --profile ops run --rm -e ALLOW_DESTRUCTIVE_RESTORE=YES -e BACKUP_FILE=/backups/<file>.dump.age restore-postgres`.
4. The restore script verifies the sidecar before decrypting and runs `pg_restore --clean --if-exists --single-transaction`.
5. Validate application data and record measured restore duration/RPO/RTO. A restore command succeeding is not the same as an application recovery drill passing.

## 5. Monitoring
- Start optional observability stack with `docker compose --env-file .env.prod -f docker-compose.prod.yml --profile observability up -d`.
- Prometheus scrapes `/internal/metrics` with a mounted bearer token.
- Grafana and Prometheus are bound to loopback host ports by default; access through an SSH tunnel or secured internal gateway.
- Alertmanager posts firing/resolved alerts to `ALERT_WEBHOOK_URL`.
- Validate the receiver, alert routing and dashboards after deployment.

## 6. Security notes
- PostgreSQL and Redis have no published host ports.
- API and worker containers run non-root; web/edge Nginx uses the unprivileged image.
- Secrets are mounted as files and loaded by the API config module.
- TLS termination and certificates are operator-managed.
- Keep `.env.prod`, `secrets/`, `certs/` and `backups/` out of source control.
