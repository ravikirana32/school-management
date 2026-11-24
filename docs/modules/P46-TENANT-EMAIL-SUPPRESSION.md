# P46 — Tenant-local email suppression

Email addresses are normalized and HMAC-SHA256 hashed with a dedicated stable secret. Cleartext addresses are not persisted or returned. Suppressions are scoped by organization and school; a complaint in one school does not globally suppress a shared guardian email across unrelated tenants. Reasons: BOUNCE, COMPLAINT, MANUAL, PROVIDER_POLICY.

School users with `school.settings.manage` can list, create and release suppressions. Release requires a reason. Creation/release writes an audit event. An active partial unique index prevents duplicate active suppression rows for the same school/address. The notification worker checks the recipient hash immediately before provider submission and cancels matching outbox rows. Missing hash secret prevents the worker from starting, failing closed.

This is a school-local suppression mechanism, not a replacement for a future provider-wide legal complaint suppression list.
