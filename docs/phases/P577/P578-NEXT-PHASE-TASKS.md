# P578 Next-Phase Tasks — Reliability & Operational Acceptance (C2-11)

**Baseline:** P577 cumulative. **P577 status:** source test foundation delivered; browser/mobile/accessibility acceptance blocked.

## Entry gates
1. Authentic pnpm 9.15.0 lockfile and frozen install.
2. Prisma validate/generate and clean/upgraded PostgreSQL migrations.
3. All workspace semantic typechecks and production builds.
4. Production-role RLS, cross-tenant API and pooled-connection acceptance.
5. Provisioned test database, load generator, metrics/tracing and backup target.

## P578 workstream
1. Define workload profiles and measurable SLOs for API latency, throughput, error rate and queue lag.
2. Run load, stress, soak and burst tests across authentication, admissions, attendance, fees, transport, hostel, notifications and background workers.
3. Validate worker idempotency, lease expiry, graceful shutdown, retry, dead-letter and recovery.
4. Test Redis/PostgreSQL outage, connection exhaustion, dependency timeout and degraded-mode behavior.
5. Verify backup/restore, point-in-time recovery, RPO/RTO and tenant data isolation after restore.
6. Validate metrics, traces, logs, alert routing, dashboards and runbooks without leaking student PII/secrets.
7. Test scheduled jobs, timezones, DST/calendar boundaries and duplicate execution protection.
8. Archive reproducible commands, environment manifests, sanitized logs and capacity recommendations; keep unexecuted gates OPEN.

**Exit criteria:** all defined SLOs pass under representative load, recovery drills meet approved RPO/RTO, worker/job lifecycle is verified, and observability/security evidence is independently reproducible. If toolchain/database prerequisites remain blocked, P578 remains BLOCKED and may only deliver test plans/static instrumentation.
