# Environments and Deployment Baseline

## Environments
- Local: Docker Compose, seeded development data and mock/sandbox integrations.
- Development: shared developer integration environment.
- QA/Staging: production-like configuration, synthetic/test data and provider sandboxes.
- Production: isolated secrets, managed/persistent data services, backups and monitoring.

## Deployment components
- NGINX/TLS edge.
- Web application hosting.
- Node.js API containers.
- Background worker containers.
- PostgreSQL.
- Redis.
- Private object storage.
- Monitoring/logging/tracing.
- Backup and restore jobs.

## Operational rules
- Secrets are never committed to source control.
- Use environment-specific secret management.
- Database migrations run as controlled release jobs.
- Backups are encrypted and restoration is tested.
- Use health/readiness endpoints.
- Use rolling or blue/green deployment where supported.
- Maintain rollback procedures for application releases and forward-fix strategy for irreversible migrations.
- Separate provider sandbox and production credentials.
- Configure rate limits, WAF/edge protection and alerting.
- Define RPO/RTO before production.

## P01 deliverables
Monorepo, Docker Compose, environment examples, health checks, CI workflow, database connection, Prisma migration workflow, seed strategy, lint/typecheck/test scripts and local developer guide.
