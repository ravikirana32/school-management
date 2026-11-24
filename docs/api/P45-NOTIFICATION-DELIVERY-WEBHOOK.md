# P45 notification webhook API

- `POST /api/v1/webhooks/notifications/:provider`
- Requires `NOTIFICATION_EMAIL_WEBHOOK_PROVIDER` and a 32+ character `NOTIFICATION_EMAIL_WEBHOOK_SECRET`.
- Signature header: `x-school-email-signature`, format `t=<unix>,v1=<HMAC-SHA256 hex>`.
- Canonical body schema and event mapping: see `docs/modules/P45-NOTIFICATION-DELIVERY-RECEIPTS.md`.
- `200`: accepted or duplicate; `400`: invalid canonical event; `401`: missing/invalid/expired signature; `404`: unknown provider or outbox; `503`: not configured.
- Event writes and outbox state reconciliation run in one transaction under notification-worker RLS context.
