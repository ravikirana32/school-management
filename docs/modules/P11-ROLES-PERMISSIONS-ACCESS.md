# P11 — Roles, permissions and staff access hardening

## Delivered source foundation
- Permission catalog for staff, students, admissions, attendance, academics, fees, reports, school settings and access administration.
- Baseline school roles: HR Manager, Principal, Department Head, Teacher and Front Office, with limited least-privilege permission sets.
- School-scoped custom role creation from known permission keys.
- Role assignment to users who already have active school membership; role assignment revocation.
- Current-user role/permission introspection for any active school member.
- Staff account linking only when a matching existing account has a verified email address.
- Teacher self-service endpoint returns assignments for the linked active staff profile only.
- Permission resolver helper and tests for exact, module-wildcard, global-wildcard and platform-admin matching.

## Security boundaries
The existing School Admin-only APIs remain guarded by School Admin checks. P11 does not yet migrate all module routes to fine-grained permission checks. Teacher self-service is a narrow read-only route; it does not grant access to student records, grades, attendance or staff directory data.

## Account linking limitation
The link-account endpoint links a staff profile to an existing user with a verified matching email. It does not create accounts, send invitations, issue passwords or deliver email. A token hash is retained in a StaffInvitation audit row; there is no public token redemption route.
