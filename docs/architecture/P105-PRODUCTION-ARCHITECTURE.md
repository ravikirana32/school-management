# P105 Production Architecture

- Nginx edge terminates TLS and routes API and four SPA hostnames.
- API and workers use a shared non-root Node 22 image.
- PostgreSQL and authenticated Redis are isolated on an internal Docker network with persistent volumes.
- A one-shot Prisma migration service gates API/worker startup.
- Background workers are isolated processes and have restart policies.
- PostgreSQL backups run as a separate least-privilege operational image and are encrypted with age before storage.
- Prometheus scrapes an authenticated internal metrics endpoint; Alertmanager routes alerts; Grafana provisions a dashboard.
- Request IDs and W3C traceparent context are attached to logs and propagated in response headers.

P105 is a single-host Docker Compose deployment foundation. High availability, multi-region failover, WAL/PITR, offsite backup replication and full distributed tracing remain future work.
