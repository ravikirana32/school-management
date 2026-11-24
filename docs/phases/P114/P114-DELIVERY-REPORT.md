# P114 Delivery Report

P114 adds privacy-safe authentication abuse telemetry and a platform-admin-only summary endpoint. Metrics are stored as Redis daily hashes with a 35-day TTL; only allowlisted event names and integer counts are stored. The endpoint returns at most seven UTC days.

The implementation is best-effort: metric failures are swallowed and do not affect login, refresh or rate-limit decisions. It does not implement alert delivery or progressive account controls.

Gap changes: P113-G002 is now PARTIALLY_IMPLEMENTED; P114-G001 is PARTIALLY_IMPLEMENTED; P114-G002 is READY_FOR_VERIFICATION; P114-G003 is OPEN. No gaps are closed in this phase. Root and docs gap registers are byte-identical.
