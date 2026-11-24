# P70 — Tenant Isolation and RLS Acceptance Foundations

## Delivered
- Unit-test source for organization/school/user GUC scoping and bounded service contexts.
- Catalog SQL for every table carrying `organizationId` or `schoolId` to require ENABLE + FORCE RLS and at least one policy.
- Application role posture assertion against SUPERUSER and BYPASSRLS.
- Static verifier and phase artifacts.

## Required runtime acceptance
1. Apply every migration to a clean PostgreSQL instance.
2. Set `p70.application_role` to the real non-owner application role and run the catalog SQL.
3. Run two-tenant/two-school isolation tests for SELECT/INSERT/UPDATE/DELETE.
4. Test missing GUCs, empty school scope, transaction rollback and pooled-connection reuse.
5. Test privileged service contexts and prove request handlers cannot invoke them.
6. Preserve SQL output and test logs before changing gap status.

The catalog script only proves RLS is enabled/forced and a policy exists. It cannot prove policy expressions are semantically correct; behavioral tests remain mandatory.
