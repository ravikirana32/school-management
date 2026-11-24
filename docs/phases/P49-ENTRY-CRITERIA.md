# P49 entry criteria

1. Continue P45–P48 notification lifecycle acceptance: migration order/apply, tenant RLS, webhook signature/replay/order/idempotency, school-local suppression and audit transaction boundaries, current/previous HMAC rollover, worker pre-send and lease behavior.
2. Add executable test coverage using the repository's existing test conventions; use disposable PostgreSQL/Redis and a non-owner non-BYPASSRLS role when services are available.
3. Verify key configuration consistency across API and worker; document operational rotation/rollback runbook and active-row retirement query without logging hashes or secrets.
4. Preserve the no-plaintext-email property and fail-closed behavior.
5. Do not implement provider-native adapters until provider selection; do not enable destructive retention cleanup before legal-hold/retention policy.
6. Keep Arabic RTL shaping/tagged PDF tracked until a maintained dependency is selected and script-specific visual/extraction acceptance can be run.
7. Carry every unresolved P00–P48 gap forward; close only with implementation and reproducible evidence.
