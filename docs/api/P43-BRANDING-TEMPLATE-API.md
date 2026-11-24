# P43 API Contract Notes

All routes are versioned under `/api/v1`, authenticated and scoped to an active school membership. Permissions are checked per route.

## Logo upload

1. Request an upload with `mimeType` (`image/png` or `image/jpeg`) and `sizeBytes` (1–5,242,880).
2. Upload directly to the returned presigned POST fields within five minutes.
3. Call the completion path. The API verifies S3 object metadata and exact size before queueing malware scanning.
4. Poll the logo GET endpoint after scanner approval. It returns a short-lived signed URL only for the active CLEAN asset.

The API does not accept arbitrary object keys from the caller. Upload keys and asset IDs are server-generated.

## Named templates

Create body fields: `templateKey`, `version`, `displayName`, `brandColor`, optional `footerText`, optional `signatureLabel`. The template key is a lowercase slug. A template version starts as DRAFT. Activation retires the previous active version for that key. Activated content cannot be edited; create a new version instead.

The report-card publisher uses the most recently activated named template for the school, falling back to the legacy policy template when none exists.

## Notification outbox leases

The email worker atomically claims an eligible row with a conditional `UPDATE ... WHERE status ...` through Prisma `updateMany`. Each claim has a random owner and a 90-second lease. Completion and failure updates require the same owner. Reconciliation requeues expired leases. Provider idempotency key remains the outbox ID to reduce duplicate-send risk after a worker crash.
