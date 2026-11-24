# P17 Teacher Membership Security

- Identity comes only from `req.auth.userId` populated by the authentication middleware.
- No client-supplied tenant identifiers are accepted for discovery.
- Active membership is checked before tenant-scoped reads.
- Organization, school and active staff profile are revalidated under tenant context with RLS settings applied transaction-locally.
- Only the caller's staff profile, school roles and active assignments are returned.
- No email, phone, address, student information or access/refresh token is included.
- School selection is a convenience, not an authorization boundary: every subsequent API continues to authenticate, validate membership, and enforce the selected tenant scope.
- Production acceptance still requires PostgreSQL RLS integration tests, cross-tenant negative tests, response privacy review and mobile device tests.

The P17 migration adds a permissive SELECT-only self-read policy on `SchoolMembership`, constrained to `app.current_user_id`; it does not permit writes. Verify policy interaction with the pre-existing tenant policy in PostgreSQL before production.
