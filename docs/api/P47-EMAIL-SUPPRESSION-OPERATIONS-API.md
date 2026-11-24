# P47 Email suppression operations API

P47 reuses the P46 endpoints; no new route contract is introduced.

Base route:
`/api/v1/:organizationId/:schoolId/notification-suppressions`

- `GET ?status=ACTIVE|RELEASED`: returns up to 100 newest records for the selected school, with reason, state, timestamps, optional provider event reference and school-scoped audit events. It never returns email address or email hash.
- `POST`: accepts `{ email, reason }`, where reason is `BOUNCE`, `COMPLAINT`, `MANUAL` or `PROVIDER_POLICY`. The server normalizes and HMAC-hashes the email; cleartext is not stored.
- `POST /:suppressionId/release`: accepts a mandatory 8–500 character reason. Release is actor-attributed and audited.

Authorization requires an authenticated active school membership and `school.settings.manage`. UI permission checks are convenience only; the API remains authoritative. All operations execute inside tenant context.

Provider-global suppression and provider-native webhook adapters are out of scope until a provider is selected.
