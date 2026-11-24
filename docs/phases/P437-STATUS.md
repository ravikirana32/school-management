# P437 — Export Queue Capacity & Backpressure

## Delivered source slice
- Added configurable active export queue capacity per school (default 25; bounded 1–500).
- Added configurable active export queue capacity per requester within a school (default 5; bounded 1–100).
- Active capacity counts include queued and processing jobs and are scoped to organization + school; requester limit additionally scopes requester.
- Identical filter requests from the same requester that are already queued are rejected with HTTP 409 and the existing job ID.
- Capacity saturation returns HTTP 429, `Retry-After: 60`, and a structured capacity/retry response.
- Added defaults to `.env.example` and source verifier.

## Verification
- P437 focused source verifier: 12/12 PASS.
- Regression verifiers: P436, P435, P434, P433, P432 run in this phase (results recorded in test report).
- TypeScript syntax diagnostics recorded for route source.

## Limitations / remaining runtime gaps
- Queue count + create are within a tenant transaction but no DB-level constraint/serializable lock was added; simultaneous request races may briefly exceed caps. Runtime concurrency validation remains open.
- Worker fairness is FIFO by global createdAt, not weighted/round-robin across schools.
- Full API build/typecheck, Prisma validate, live DB/API, RLS, UI/mobile E2E, and worker load tests are not claimed unless separately run.
