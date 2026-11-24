# P40 security notes

- Lookup and template APIs use the authenticated active-school permission guard.
- Template writes require `reports.manage`; no arbitrary object keys or external URLs are accepted.
- Parent notification preferences are scoped to the authenticated user, organization and school. A caller cannot submit another user ID.
- Publication recipient resolution is server-side and requires an active guardian, a communications-enabled student link, accepted consent with a non-null acceptance timestamp and no withdrawal timestamp.
- Recipient accounts are deduplicated; opted-out in-app recipients are excluded.
- Batch/outbox/preference tables have forced RLS and composite organization/school foreign keys.
- Notification payloads do not contain PDF storage object keys, signed URLs, student PII beyond a first-name greeting, or guardian email/phone.
- PDF objects remain in private S3-compatible storage with AES256 server-side encryption; signed download URLs remain short-lived.
- P40 has no external email/push provider dispatcher; do not represent EMAIL/PUSH preference storage as delivery capability.
