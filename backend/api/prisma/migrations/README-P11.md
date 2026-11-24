# P11 migration

Migration: `20261116200000_p11_access_hardening`. Apply after P01–P10 migrations and successful Prisma validation. Adds StaffInvitation, forced RLS, tenant FK, RBAC relation constraints and assignment uniqueness. Existing RBAC data must be checked for duplicate assignments before applying the unique index. Migration application and rollback were not performed in P11.
