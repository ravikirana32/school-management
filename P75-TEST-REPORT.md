# P75 Test Report

- Static worker shutdown verifier: `node scripts/verify-p75-worker-shutdown.mjs`.
- Vitest tests added for order/idempotency/failure; not executed because dependencies are unavailable.
- SIGTERM/SIGINT process integration tests and active-job drain tests not run.
