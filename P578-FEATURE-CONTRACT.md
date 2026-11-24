# P578 Feature Contract

## Worker shutdown
- Shared shutdown is idempotent across overlapping signal requests.
- Stops new scheduling before cleanup.
- Performs worker drain, queue close and database disconnect in that order.
- Each asynchronous step has a configurable timeout (10 seconds default).
- Attempts subsequent cleanup steps even after an earlier step fails or times out.
- Surfaces all cleanup failures as AggregateError.
- Timeout does not cancel the underlying operation; caller/supervisor owns final hard-stop policy.

## Load smoke
- k6 profile only accepts an HTTPS base URL.
- Uses a small bounded constant-VU profile by default.
- Has provisional request-failure and p95 thresholds.
- It is not a capacity test and is not run against production.

## Operational runbook
- Defines failure/recovery drills, backup and isolated restore acceptance, RPO/RTO evidence, observability and PII-safe telemetry expectations.
- Does not claim those drills were executed.

## Acceptance status
Source and static verification delivered. Runtime operations, load, backup/restore, failover and RPO/RTO remain blocked/open.
