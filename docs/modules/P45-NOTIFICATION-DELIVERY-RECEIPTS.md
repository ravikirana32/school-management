# P45 — Notification delivery receipts

## Scope
P45 adds a provider-neutral canonical email event contract. A provider-specific adapter must verify the provider's native webhook signature and translate its events to this contract; until a provider is selected, this endpoint is not represented as a drop-in integration for any vendor.

## Canonical webhook
`POST /api/v1/webhooks/notifications/:provider`

Headers: `x-school-email-signature: t=<unix-seconds>,v1=<hex-hmac-sha256>`. The signature is HMAC-SHA256 over `<timestamp>.` followed by the exact raw request body. The timestamp tolerance is five minutes. Provider ID must exactly match `NOTIFICATION_EMAIL_WEBHOOK_PROVIDER`; secret is `NOTIFICATION_EMAIL_WEBHOOK_SECRET`. Both must be configured or endpoint returns 503.

Body fields: `id`, `type` (`email.delivered`, `email.bounced`, `email.complained`), `occurredAt` (ISO timestamp), and `data.outboxId` plus optional `data.messageId`. Unknown fields are rejected. Provider adapters must authenticate native webhook requests first, then emit this canonical signed envelope; do not forward unsigned events.

## State handling
Provider/event ID is unique. Duplicate events return success without reapplying. Event history is retained with SHA-256 of the exact payload. Outbox state maps to `DELIVERED`, `BOUNCED` or `COMPLAINED`. Events older than the last accepted provider event are recorded for audit but do not overwrite newer state. The notification worker does not retry bounced/complained records.

## Security
Webhook handling uses the isolated notification-worker RLS context, never accepts organization/school IDs from the payload, and derives tenant scope from the referenced outbox record. Signature comparison is constant-time; request body size remains bounded by the API JSON parser. Provider message content and recipient addresses are not copied into the event ledger.

## Limitations
No email vendor has been selected. Provider-native signature verification, provider event mapping, delivery receipts, bounce classification, complaint suppression semantics, and sandbox tests remain adapter work. PUSH provider/device lifecycle is not part of P45.
