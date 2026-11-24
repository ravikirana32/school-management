# P02 Identity and Tenancy Schema

## Core tables
`User`, `Organization`, `School`, `OrganizationMembership`, `SchoolMembership`, `Role`, `Permission`, `RolePermission`, `UserRoleAssignment`, `UserSession`, `PasswordResetToken`, `MfaFactor`, `AuditLog`.

## Invariants
- Email is globally unique; phone is globally unique when supplied.
- Organization slug is globally unique.
- School code is unique within an organization.
- A user can have one organization membership per organization and one school membership per school.
- Roles declare a scope type: platform, organization, or school.
- User role assignments carry explicit scope columns.
- Session refresh token material is never stored in plaintext.
- Audit records carry optional organization and school scope for traceability.

## Referential integrity
The SQL migration adds foreign keys for identity, membership, school, role, session and MFA relationships. `SchoolMembership.organizationId` and `schoolId` are each constrained independently; a composite constraint ensuring the school belongs to the same organization is a required hardening item.

## RLS plan
P04 will enable RLS on every tenant-owned table, use `current_setting('app.current_organization_id', true)` and `current_setting('app.current_school_id', true)`, and test missing-context denial plus cross-tenant read/write denial. The P02 transaction helper uses `set_config(..., true)` to scope values to a transaction.
