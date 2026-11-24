# P160 Delivery Report — Refund Evidence Operations Dashboard

- Added a permission-gated, tenant-scoped API dashboard for refund evidence status totals and recent evidence records.
- Dashboard reports PENDING_UPLOAD, QUARANTINED, CLEAN and REJECTED totals, plus pending uploads older than 24 hours and quarantined records whose scan request is missing or older than 10 minutes.
- Added bounded status filtering and recent-record listing with linked refund and reconciliation-note status.
- Added an authorized manual malware-scan retry for quarantined evidence, with a unique retry job ID, a one-minute request throttle based on scan-request time, and an audit event.
- Added durable storage-cleanup failure timestamp, attempt count and error-code fields; the expiry worker records failures for Finance visibility.
- Added an authorized retry-cleanup action for abandoned pending uploads older than 24 hours, guarded by the same advisory lock as scheduled expiry and audited on successful cleanup.
- Added School Admin Finance operational cards, status filtering, refresh and retry-scan action.
- Added migration `20261118230000_p160_refund_evidence_cleanup_observability` for durable cleanup failure metadata.
- Automated test creation/execution remains deferred per project instruction. Runtime database, Redis/BullMQ, scanner, storage and browser acceptance were not performed.
- Important limitation: storage cleanup retries apply only to abandoned PENDING_UPLOAD records older than 24 hours. QUARANTINED records remain under the malware-scanner lifecycle. An overdue count alone is not proof that object deletion failed.

## P160-G001 — PARTIALLY_IMPLEMENTED

Operational dashboard and manual quarantined scan retry are implemented in source. Remaining acceptance: Apply migration and regenerate Prisma client; verify API and School Admin builds/typechecks, tenant/permission isolation, retry behavior with Redis/BullMQ, scanner lifecycle, storage cleanup retry races, and runtime verification against PostgreSQL and configured object storage.
