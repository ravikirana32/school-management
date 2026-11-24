# P53 — Notification provider retry and dead-letter policy

## Delivered
- Added explicit retryable/permanent HTTP response classification.
- Worker now dead-letters permanent provider responses immediately under lease ownership; transient errors use existing retries.
- Added helper test source and static verifier.

## Validation
Static verifier 10/10 PASS. Runtime worker/provider/database acceptance remains NOT RUN.

## Test result
- Static verifier 10/10 PASS.
- TypeScript syntax 3 files, 0 diagnostics.
- Vitest and runtime worker acceptance NOT RUN.
