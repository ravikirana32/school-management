# P75 — Shared Worker Drain and Shutdown Lifecycle

## Delivered
- Shared idempotent shutdown helper.
- Consistent timer → active worker drain → queue close → Prisma disconnect ordering.
- One-shot SIGINT/SIGTERM handlers across all three workers.
- Unit-test source and static verifier.

## Acceptance still required
- Run worker tests with active, delayed, failed and stalled jobs.
- Send SIGTERM during provider request and DB transaction; verify no duplicate settlement and no premature DB disconnect.
- Verify queue close on Redis outage and process supervisor termination deadline.
- Decide and implement explicit hard-shutdown timeout policy aligned with container orchestrator grace period.
