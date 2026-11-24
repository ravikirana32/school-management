# P105 Status — Production Infrastructure, Backup/Restore and Observability

Status: PRODUCTION DEPLOYMENT SOURCE/CONFIGURATION IMPLEMENTED; BUILD, MIGRATION, RESTORE DRILL AND RUNTIME ACCEPTANCE BLOCKED/DEFERRED.

## Delivered source
- Added secret-file loading for database, Redis, JWT, encryption, metrics, suppression, provider and S3 credentials.
- Added production-only environment validation: independent JWT secrets, required encryption/metrics/suppression/S3 settings, authenticated Redis and explicit HTTPS CORS origins.
- Added secret initialization and redacted production environment checks.
- Added multi-stage API and web Dockerfiles, non-root API runtime and unprivileged Nginx web/edge images.
- Added production Compose topology for PostgreSQL, authenticated persistent Redis, migration runner, API, parent/document/notification workers, four web apps, TLS edge proxy, encrypted backup/restore, Prometheus, Alertmanager and Grafana.
- Added Nginx TLS, HTTPS redirect, security headers, body limits, connection limits and authentication rate limiting.
- Added encrypted PostgreSQL custom-format backups using age, SHA-256 sidecars, manifests and retention pruning.
- Added checksum-verified destructive restore guarded by `ALLOW_DESTRUCTIVE_RESTORE=YES`.
- Added deployment script: image pull, pre-deploy backup, Prisma migration, service rollout and readiness polling.
- Added host cron example for scheduled backup execution.
- Added request ID and W3C traceparent propagation to logs/response headers.
- Added Prometheus histogram buckets, process metrics, alert rules, Alertmanager webhook routing and Grafana dashboard provisioning.
- Added CI and manually approved production-release workflows. Both require an immutable workspace lockfile before install/build.

## Important blockers and boundaries
- `pnpm-lock.yaml` is absent in the supplied baseline. It was not fabricated. CI and Docker builds now fail closed until the complete lockfile is restored and committed.
- Docker, Compose, pnpm and PostgreSQL CLI are unavailable in this execution runtime; production image builds, Compose startup, migrations and restore drills were not run.
- PostgreSQL backups are encrypted and retained in a persistent local Docker volume; offsite replication, WAL/PITR, Redis queue snapshots/replay and tested RPO/RTO are not implemented.
- Alert delivery, Grafana dashboards, metrics scraping, TLS certificate renewal and external provider connectivity need deployment-specific credentials and runtime validation.
- W3C trace context and request IDs are propagated, but no OpenTelemetry span exporter or distributed trace backend is configured.
- API runtime image retains workspace/build dependencies; production dependency pruning is deferred until the workspace lockfile and deploy workflow are verified.
- Workers have process liveness checks only; dependency/queue-level readiness, heartbeat and automatic rollback checks remain open.
- Mobile app signing, store submission and OTA release automation are not part of this P105 web/API infrastructure slice.

## Deferred by user direction
Unit tests, API integration tests, browser/mobile E2E tests and test-case creation/execution remain deferred to later validation phases.
