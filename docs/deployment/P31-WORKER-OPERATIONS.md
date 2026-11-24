# P31 Worker Operations

## Parent invitation delivery
Run `pnpm worker:parent-delivery` from repository root (or `pnpm worker:parent-delivery` in `backend/api`) as a separate supervised process.
Required configuration: `REDIS_URL`, `DATABASE_URL`, `PARENT_INVITE_ENCRYPTION_KEY`, `PARENT_EMAIL_PROVIDER_URL`, `PARENT_EMAIL_PROVIDER_TOKEN`, `PARENT_EMAIL_FROM`, `PARENT_PORTAL_BASE_URL`.

Queue: `parent-invitation-delivery`; five attempts, exponential backoff from 30 seconds, concurrency five, 20 jobs/minute. Failed jobs are copied to `parent-invitation-delivery-dead-letter`. Worker reconciles pending DB outbox records every 30 seconds. Configure provider idempotency and bounce/delivery webhooks separately.

## Document scan dispatch
Run `pnpm worker:document-scan` from repository root (or in `backend/api`) as a separate supervised process.
Required configuration: `REDIS_URL`, `DATABASE_URL`, `S3_BUCKET` and credentials/role, `DOCUMENT_SCANNER_PROVIDER_URL`, `DOCUMENT_SCANNER_PROVIDER_TOKEN`, `DOCUMENT_SCAN_CALLBACK_URL`, `DOCUMENT_SCAN_WEBHOOK_SECRET`.

Queue: `document-malware-scan`; five attempts, exponential backoff from 20 seconds, concurrency three, 10 jobs/minute. Worker reconciles QUARANTINED records every 30 seconds and dispatches a 120-second signed download URL to the scanner provider.

## Production controls
- Use a secret manager; rotate encryption and webhook keys with a documented overlap period.
- Use distinct DB credentials and network policies for API, parent delivery and document scan workers.
- Keep queues private; do not expose Redis publicly.
- Monitor queue depth, oldest pending age, retries, dead-letter count, provider failures and scanner callback latency.
- Alert on expired invitations, repeated scan dispatch and documents remaining quarantined beyond service-level objectives.
- Configure shutdown supervision and process restart policies.
- The provider endpoints are generic adapter contracts; production provider setup and real provider acceptance are not included in this source milestone.
