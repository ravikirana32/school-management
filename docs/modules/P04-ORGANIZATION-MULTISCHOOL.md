# P04 — Organization and Multi-School Management

## Implemented source
- Organization lifecycle status (`PROVISIONING`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED`, `ARCHIVED`).
- School lifecycle status (`PROVISIONING`, `ACTIVE`, `SUSPENDED`, `CLOSED`).
- Authenticated organization onboarding creates the organization, first school, owner memberships and scoped owner/admin role assignments transactionally.
- Organization list limited to the authenticated user's active memberships.
- School listing and creation scoped to organization membership and organization-admin role assignment.
- School status changes require an organization admin and a reason.
- Organization invitation persistence, role-scoped invitations and acceptance validation against the authenticated user's email.
- Tenant context helper adds user ID to transaction-local PostgreSQL settings.
- RLS migration enables and forces row-level security for School, OrganizationMembership, SchoolMembership and UserRoleAssignment.

## API
Base path `/api/v1/organizations`:
- `POST /onboard`
- `GET /`
- `GET /:organizationId/schools`
- `POST /:organizationId/schools`
- `POST /:organizationId/invitations`
- `POST /invitations/accept`
- `PATCH /:organizationId/schools/:schoolId/status`

## Invitation delivery limitation
The API creates an invitation with a hashed token, but does not return the raw token and no email delivery adapter exists yet. Invitation acceptance therefore remains unavailable until the P05/P20 notification delivery integration provides a secure delivery path. This avoids leaking invitation credentials through API responses or logs.

## RLS boundaries
RLS is enabled for four organization-owned tables. The API must connect using a non-superuser, non-table-owner role. Tenant queries must execute inside `withTenantContext` and use the passed transaction client. The Organization, AuditLog, TenantLifecycleEvent and SupportAccessGrant tables are not yet RLS-protected in this phase; their access remains application-policy-controlled and tracked as open work.

## Known limitations
- Invitation email delivery, resend, revoke and role change flows are pending.
- School-admin role is seeded during initial onboarding; additional roles require invitation acceptance.
- Cross-school memberships for one user are supported by separate SchoolMembership records.
- Organization lifecycle enforcement across all platform endpoints, background jobs and future modules remains incomplete.
- Composite FK ensures SchoolMembership school and organization pair consistency.
- RLS migration and policies are source-only until applied and tested against PostgreSQL.
