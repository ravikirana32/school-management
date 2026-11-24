# P11 Access data model and migration

P11 extends the existing Role, Permission, RolePermission and UserRoleAssignment Prisma relationships, and adds StaffInvitation with a composite tenant FK to StaffMember and forced RLS. The migration adds RBAC join/assignment FKs and a unique scope/role assignment index. Seed logic idempotently creates a permission catalog and five least-privilege school roles. Review the migration against existing production constraints before applying; runtime validation has not been performed.
