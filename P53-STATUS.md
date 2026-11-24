# P53 Status — Notification provider retry and dead-letter policy

**Status:** Source implementation and unit-test source complete; runtime acceptance pending. **Production approval: NOT GRANTED.**

- Added a pure HTTP response classifier: 408, 425, 429 and 5xx are retryable; other statuses are permanent.
- Worker immediately marks permanent provider responses DEAD_LETTER under the active lease and records a dead-letter job without storing provider response body.
- Transient HTTP responses continue through existing BullMQ retry/backoff path; network errors remain retryable.
- If lease settlement loses the race, worker returns skipped and does not emit a false dead-letter record.
- Static verifier 10/10 PASS; TypeScript syntax: 3 files, 0 diagnostics. Vitest/Redis/PostgreSQL worker execution NOT RUN.
