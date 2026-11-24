# P75 Status — Shared Worker Drain and Shutdown Lifecycle

**Status: SOURCE DELIVERED; PROCESS-LEVEL ACCEPTANCE PENDING**

- Added a shared idempotent worker shutdown coordinator.
- All three BullMQ worker processes now stop reconciliation timers, drain active jobs, close both primary/dead-letter queues and disconnect Prisma in that order.
- Replaced duplicated `process.exit(0)` shutdown implementations with one-shot SIGINT/SIGTERM handlers and natural process exit after resources close.
- Added unit-test source for ordering, overlapping signals and drain failure behavior.

Not claimed: BullMQ runtime drain, stalled-job behavior, Redis outage shutdown, forced termination timeout or process signal tests.
