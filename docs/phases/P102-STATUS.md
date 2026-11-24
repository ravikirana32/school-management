# P102 Status — White-label and Platform Operations

Status: PARTIAL FUNCTIONAL SOURCE IMPLEMENTATION; runtime, MFA and hosting acceptance pending.

## Delivered source
- Tenant custom-domain registry with normalized hostname validation and uniqueness.
- DNS TXT ownership challenge using a one-time random challenge whose hash is stored; challenges expire after 24 hours and can be renewed.
- DNS verification via TXT lookup, explicit activation and disable/re-enable lifecycle.
- Custom-domain request middleware that resolves active host mappings and rejects organization IDs that do not match the mapped tenant on tenant URL families.
- Public tenant-context endpoint returning active tenant identity and public-safe branding fields.
- Tenant-level branding configuration: brand name, primary/secondary colors, HTTPS logo/favicon URLs, support contacts and login message.
- Public portal now resolves the custom-domain tenant context and renders tenant branding.
- Super Admin application now provides token-based platform access, tenant domain management, branding editor, support-access queue and encrypted secrets vault UI.
- Platform secrets are encrypted at rest with AES-256-GCM. Plaintext values are not returned by list or write APIs.
- Support access requests now require a distinct platform administrator to approve; request rejection and active-grant revocation are audited.
- Support approval fails closed unless the approver's session has an MFA verification timestamp no older than five minutes.
- Added tenant RLS for custom domains and tenant branding, and platform-admin-only RLS for the secrets vault.

## API surface
- GET `/api/v1/platform/organizations/:organizationId/domains`
- POST `/api/v1/platform/organizations/:organizationId/domains`
- POST `/api/v1/platform/domains/:domainId/verify`
- POST `/api/v1/platform/domains/:domainId/activate`
- POST `/api/v1/platform/domains/:domainId/disable`
- GET/PUT `/api/v1/platform/organizations/:organizationId/branding`
- GET/PUT/DELETE `/api/v1/platform/secrets`
- GET/POST `/api/v1/platform/support-access-grants`
- POST `/api/v1/platform/support-access-grants/:grantId/approve`
- POST `/api/v1/platform/support-access-grants/:grantId/reject`
- POST `/api/v1/platform/support-access-grants/:grantId/revoke`
- GET `/api/v1/public/tenant-context`

## Important limitations
- The current authentication flow does not implement an MFA challenge-completion route and therefore does not populate `UserSession.mfaVerifiedAt`. Support-grant approval is intentionally blocked until a verified MFA flow is implemented; do not manually set this field.
- The support-grant record lifecycle is implemented, but support impersonation/tenant data access is not activated by a grant. No tenant access bypass is introduced.
- Custom domain DNS ownership verification is implemented; DNS CNAME configuration, TLS certificate provisioning, edge routing and renewal are deployment responsibilities and were not tested.
- Public portal consumes tenant branding; other application shells do not yet consume tenant-context branding.
- Secret encryption requires `PLATFORM_SECRET_ENCRYPTION_KEY` (at least 32 characters). The key is not supplied in source. Multi-key rotation/re-encryption automation and consumer integration are not yet implemented.
- Prisma validation/client generation, migration execution, semantic typecheck, app builds and runtime acceptance have not been run.
- Unit/API/browser/mobile test creation and execution are deferred by user direction.

## Release assessment
P102 is not production-approved. Source-level workflows are present, but MFA completion, support-grant enforcement, TLS/domain operations, secret key lifecycle and runtime verification remain open.
