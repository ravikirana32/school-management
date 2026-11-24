# P438 — Export Queue Fair Scheduling & Worker Configuration

## Delivered
- Worker now scans a configurable, bounded FIFO candidate window (default 200, bounds 10–500).
- Scheduler prefers the next queued export from a school different from the last successfully claimed school, reducing monopolization when multiple schools have queued work.
- FIFO fallback is retained when the candidate window contains no alternate school.
- Worker polling interval is configurable (default 15 seconds, bounds 1–120 seconds).
- Conditional QUEUED-to-PROCESSING claim remains the safety guard against duplicate claims.

## Configuration
- `REMINDER_AUDIT_EXPORT_WORKER_INTERVAL_MS=15000`
- `REMINDER_AUDIT_EXPORT_SCHOOL_SCAN_LIMIT=200`

## Limitations
- Fairness cursor is process-local and resets on worker restart.
- Scheduler still processes one job per cycle (single concurrency); worker scaling/concurrency is not implemented in this phase.
- Fairness only considers the bounded candidate window; a school outside it can wait until earlier queued jobs move.
- No live DB/load test, full workspace build/typecheck, or E2E was run.
