# P102 — Database Changes

Migration: `20261118010000_p102_white_label_platform_operations`.

- `TenantCustomDomain`: unique hostname, organization scope, hashed DNS challenge, verification/activation lifecycle.
- `TenantBranding`: one branding record per organization.
- `PlatformSecret`: encrypted secret payload, nonce, authentication tag, key version and actor metadata.
- `SupportAccessGrant`: request/approval status, requester, approver, timestamps and rejection/revocation reasons.
- `UserSession.mfaVerifiedAt`: timestamp reserved for a verified MFA challenge; current auth flows do not populate it yet.

RLS: tenant domain and branding tables are forced tenant-scoped with a platform-admin control-plane exception. PlatformSecret is forced platform-admin-only.

Migration and Prisma validation are pending runtime/database acceptance.
