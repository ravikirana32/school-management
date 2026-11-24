# P51 — Webhook route-level regression tests

## Delivered
- Added mocked route-level tests for notification webhook configuration, provider allowlist, signature rejection, success, replay, missing outbox and out-of-order events.
- The successful route test signs the raw JSON bytes captured by Express middleware.
- Added static verifier for test coverage and raw-body middleware ordering.

## Validation
Static verifier 10/10 PASS; changed test TS syntax 0 diagnostics. Vitest and real database integration acceptance remain NOT RUN.
