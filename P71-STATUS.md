# P71 Status — Runtime Readiness and Graceful Shutdown

**Status: SOURCE FOUNDATION DELIVERED; LIVE SERVICE ACCEPTANCE PENDING**

- `/health/ready` now checks PostgreSQL and Redis concurrently and returns HTTP 503 when either dependency is unavailable.
- Probe errors are reduced to safe status values; driver errors/credentials are not returned to clients.
- API shutdown now closes the HTTP listener, disconnects Prisma and quits the readiness Redis client with a 10-second forced-shutdown ceiling.
- Added unit-test source for healthy/degraded dependencies and concurrent probes.

Not claimed: actual PostgreSQL/Redis probes, container health integration, in-flight request drain under load, worker shutdown, or Vitest execution.
