# Alerts, Storage and Evidence — P165–P172 Closure Matrix

## Alert taxonomy
- `DOCUMENT_WORKER_DEGRADED` — CRITICAL; emitted after the configured failure threshold.
- `DOCUMENT_WORKER_RECOVERED` — INFO; recovery transition.
- `DOCUMENT_SCAN_DEAD_LETTER` — ERROR; scan dispatch reaches terminal BullMQ failure and is dead-lettered.
- `REFUND_EVIDENCE_CLEANUP_FAILED` — WARNING; cleanup metadata is persisted and alert is emitted.

Alert payloads must contain operational identifiers and error classes only. Never include document bytes, signed URLs, webhook tokens, student names, contact data, or other PII/secrets. Event keys are bounded and time-windowed to reduce duplicate notifications. New producers should use `modules/operations/alert-contract.ts`.

## Storage boundaries
- Uploads are private and use bounded presigned requests.
- Uploaded objects are checked via `HeadObject`; MIME and size validations are enforced by the request workflow.
- Quarantined objects are not downloadable. Only clean objects are promoted and receive short-lived download links.
- Database records are not authoritative bucket inventory or byte-quota measurements.
- Tenant quota enforcement and periodic provider inventory reconciliation remain OPEN.

## Evidence lifecycle
- `PENDING_UPLOAD`: abandoned upload cleanup is scheduled after 24 hours.
- `QUARANTINED`: scanner/reconciliation lifecycle only; excluded from abandoned upload expiry.
- `CLEAN`: eligible for secure access through scoped download workflow.
- `REJECTED`: not downloadable; cleanup must remain retryable if object deletion fails.
- Local staff-mobile upload copies support retry/recovery and are removed after completion/cancellation.

## Alert delivery
- Durable outbox, dedupe key, retry/backoff, webhook idempotency header, worker recovery and acknowledgement history exist in source.
- Delivery depends on webhook configuration; runtime provider delivery is not verified here.

## Closure acceptance checklist (deferred validation phase)
- [ ] API/web builds and Prisma migration application
- [ ] PostgreSQL tenant/RLS authorization tests
- [ ] Redis queue retry, duplicate job and dead-letter behavior
- [ ] S3-compatible storage upload/HEAD/copy/delete and signed URL expiry
- [ ] Scanner callback authentication, replay/skew rejection, malicious/malformed files
- [ ] Clean promotion, rejected cleanup retry and cancellation/completion races
- [ ] iOS/Android Staff app builds, offline restart and durable retry
- [ ] Tenant quota accounting and inventory reconciliation
- [ ] Webhook provider failure/recovery/idempotency
- [ ] Alert coverage audit across all services/workers
