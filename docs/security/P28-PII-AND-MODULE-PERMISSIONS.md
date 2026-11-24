# P28 — PII and Module Permission Controls

## Deny-by-default module permissions

The student, staff, access and curriculum routers now check the effective school permission set in addition to active school membership. Client navigation is not an authorization boundary.

## PII permissions

- `students.pii.read`: gates guardian contacts, pickup contacts and student document metadata on the student detail endpoint.
- `staff.pii.read`: gates staff email, phone, alternate phone, address, date of birth, emergency contact and notes on list/detail endpoints.
- School Admin receives all seeded permissions through the existing idempotent seed.
- Principal receives `students.pii.read` in the baseline role definition.
- HR receives `staff.pii.read` in the baseline role definition.

PII access is logged to `AuditLog` with actor, tenant, action, resource and outcome. List reads record page and page size rather than copying PII into audit metadata.

## Access administration

Role/assignment listing and mutations require their dedicated permissions. Assignment writes verify the target is an active membership and the role belongs to the allowed school/organization scope. Revocation is school-scoped and actor-attributed.

## Remaining controls

- PII access policies need a formal retention/export policy and a full endpoint inventory.
- Verify forced RLS and all permission paths using a non-owner database role.
- API-level permission checks and PII audit events require integration tests; source presence is not runtime evidence.
- Protect production audit retention with a separate restricted sink and DBA privilege separation.
