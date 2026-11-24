# P48 Suppression Hash Versioning

`NotificationEmailSuppression.hashVersion` identifies the HMAC key used for `emailHash`. The additive migration sets existing records to `v1`.

Environment variables:
- `NOTIFICATION_SUPPRESSION_HASH_CURRENT_SECRET` (preferred; legacy `NOTIFICATION_SUPPRESSION_HASH_SECRET` is fallback)
- `NOTIFICATION_SUPPRESSION_HASH_CURRENT_VERSION` (default `v1`)
- `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_SECRET` (optional)
- `NOTIFICATION_SUPPRESSION_HASH_PREVIOUS_VERSION` (required when previous secret is set)

API create checks active records for each configured `(hashVersion,emailHash)` pair and writes with the current pair. Worker pre-send enforcement checks the same pair set. The list API continues to omit hash material.
