# P43 Security Notes

- School brand assets are tenant/school scoped and protected by forced RLS.
- Scanner callback discovery is restricted by document ID and object-key session settings; callback signature and timestamp are HMAC verified by the existing scanner callback contract.
- Scanner worker receives only a private, short-lived download URL. CLEAN verdict promotes the object; REJECTED or MIME mismatch deletes/rejects it.
- The active school profile logo key is updated only after a CLEAN verdict.
- Logo read returns a 60-second signed URL after checking the active profile key maps to a CLEAN asset in the same school.
- Template list/create/activate routes use active school membership and separate read/manage/approve permissions. SQL enforces one active version and prevents edits to activated content.
- Outbox worker leases use random owner tokens, bounded expiry and conditional settlement. The provider idempotency key is stable per outbox row.

Runtime RLS, object-store permissions, scanner callback and concurrent worker behavior have not yet been integration tested. Deployment must use the dedicated scanner and notification worker database roles and non-owner credentials.
