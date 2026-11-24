# P02 — Authentication, Identity, Authorization and Tenant Security

## Delivered foundation
- Global `User` identity with unique email and optional unique phone.
- Organization and school entities with user memberships and membership states.
- Scope-aware roles, permissions, role-permission mappings and user role assignments.
- User sessions with hashed refresh-token storage, expiry and revocation state.
- Password reset token and MFA factor persistence models.
- Audit log persistence model with organization/school scope fields.
- Argon2id password hashing helper and opaque refresh/reset token hashing.
- Short-lived signed access tokens; refresh tokens are opaque and stored as SHA-256 hashes.
- Authentication routes for registration, login, refresh, logout and non-enumerating forgot-password response.
- Bearer authentication middleware and authorization/scope primitives.
- Transaction helper that sets PostgreSQL tenant context with `SET LOCAL` inside an interactive transaction.

## Security design notes
1. A user identity is global. Organization and school access is granted through explicit memberships and scoped role assignments.
2. A request must not trust organization or school IDs supplied by a client. Resolve requested scope against active memberships before using tenant data.
3. Tenant context is transaction-local. All tenant-owned reads/writes must use the transaction client passed to `withTenantContext`; do not set session-level variables on pooled connections.
4. PostgreSQL RLS policies are not enabled by this phase. The helper is groundwork only. P04 must add policies and negative cross-tenant integration tests.
5. Refresh-token rotation revokes the old session and creates a new session in a transaction. Production hardening should revoke a token family when reuse is detected and emit an audit event.
6. Access tokens last 10 minutes. Refresh tokens are 48 random bytes and persisted only as SHA-256 hashes.
7. Password reset currently returns a generic response but does not issue or deliver a reset token. Delivery, throttling, reset completion, and anti-abuse controls remain open.
8. MFA is schema groundwork only. No TOTP/SMS/email verification flow or recovery codes are enabled.
9. Registration creates an unprivileged global user only. It does not create an organization, school, or administrator membership.
10. Production deployment must use TLS, secure cookie/token storage, secret rotation, strict CORS, rate limiting, and trusted-proxy configuration.

## Known limitations
- The initial route implementation depends on the generated Prisma client and database; it has not been runtime executed in this environment.
- The Prisma schema and SQL migration need validation against the actual P01 schema and clean PostgreSQL database.
- Membership authorization lookup and permission loading are not yet wired into route-level policy enforcement.
- Login currently returns refresh token in JSON; production clients should move it to an appropriately protected secure, HttpOnly cookie or native secure storage.
- The refresh rotation creates a new session record rather than preserving a token-family record; reuse detection and family revocation need a follow-up.
- No account lockout, IP/device risk engine, email verification, invitation acceptance, or password reset completion yet.

## P116 MFA operational requirements

- TOTP factors use AES-256-GCM encrypted seeds. Configure `MFA_ENCRYPTION_KEY` as a base64-encoded 32-byte secret in the API secret manager and provide the same value to every API instance.
- Generate a new deployment key with `openssl rand -base64 32`; do not commit the value to source control or logs.
- Do not rotate or lose this key without a planned re-encryption migration. Existing authenticator seeds cannot be decrypted with a replacement key.
- Serve enrollment responses only over HTTPS. Never log the returned TOTP seed or `otpauthUri`.
- Recovery codes are displayed once and stored only as SHA-256 hashes. Users must store them in a secure password manager.
- Platform administrator routes require an enrolled TOTP factor and an MFA verification timestamp from the current session within five minutes.
- The P116 migration must be applied before using recovery codes. Confirm migration and secret configuration before enabling administrator access.
