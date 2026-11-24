# P102 — White-label and Platform API

Platform endpoints require an authenticated platform administrator. Tenant custom-domain and branding reads/writes use the platform RLS context; secrets are platform-admin-only.

## Custom domains
- `GET /api/v1/platform/organizations/:organizationId/domains`
- `POST /api/v1/platform/organizations/:organizationId/domains` with `{ "hostname": "portal.example.edu" }`
- `POST /api/v1/platform/domains/:domainId/challenge` (rotate/reissue a 24-hour challenge)
- `POST /api/v1/platform/domains/:domainId/verify`
- `POST /api/v1/platform/domains/:domainId/activate`
- `POST /api/v1/platform/domains/:domainId/disable`

Registration returns a DNS TXT challenge. Publish `school-saas-verification=<token>` at `_school-saas-verification.<hostname>`. Only matching TXT ownership proof can move a pending domain to VERIFIED. Challenges expire after 24 hours. Activation is a separate platform-admin action and requires an active organization.

## Tenant branding
- `GET /api/v1/platform/organizations/:organizationId/branding`
- `PUT /api/v1/platform/organizations/:organizationId/branding`

Fields: brandName, primaryColor, secondaryColor, logoUrl, faviconUrl, supportEmail, supportUrl, loginMessage. Logo/favicon/support URLs must use HTTPS.

## Public tenant resolution
- `GET /api/v1/public/tenant-context`

The request Host must match an ACTIVE custom domain. The response contains only public organization identity and public branding fields.

## Support access
- `GET/POST /api/v1/platform/support-access-grants`
- `POST /api/v1/platform/support-access-grants/:grantId/approve`
- `POST /api/v1/platform/support-access-grants/:grantId/reject`
- `POST /api/v1/platform/support-access-grants/:grantId/revoke`

Approval requires a different administrator and a session MFA timestamp within five minutes. The current auth system does not yet set this timestamp, so approvals are fail-closed until a verified MFA flow is delivered. Grant records do not themselves enable impersonation or bypass tenant authorization.

## Secrets
- `GET /api/v1/platform/secrets`
- `PUT /api/v1/platform/secrets/:key` with `{ "value": "..." }`
- `DELETE /api/v1/platform/secrets/:key`

Secret list/write responses never include plaintext. Configure `PLATFORM_SECRET_ENCRYPTION_KEY` before saving secrets.
