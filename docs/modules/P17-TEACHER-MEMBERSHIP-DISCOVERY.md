# P17 — Teacher Membership Discovery & School Selection

## Goal
Remove manual organization/school ID entry from the Teacher mobile attendance workflow. A signed-in teacher discovers only active school memberships belonging to their own identity and selects a school from server-returned options.

## Backend
- `GET /api/v1/teacher/me/schools` is authenticated and accepts no tenant identifiers.
- The route first reads the caller's active `SchoolMembership` rows using identity context and PostgreSQL RLS. P17 adds a SELECT-only self-read policy so the user can discover memberships without knowing an organization ID.
- Each membership is revalidated under its organization/school tenant context.
- Inactive organizations/schools and memberships without a linked active `StaffMember` are excluded.
- The response includes minimal organization/school identity, teacher display identity, school-scoped role names and active teaching assignments.
- Results are capped at 100 memberships. No cross-tenant enumeration endpoint is exposed.

## Teacher mobile
- Calls membership discovery after sign-in and after restoring a secure session.
- Offers a school picker when more than one active teacher membership exists.
- Auto-selects the only returned school when exactly one is available.
- Refreshes the school list on demand and clears school-specific workspace state when another school is selected.
- The attendance API calls continue to use the selected server-returned organization and school IDs.

## Limitations
- This is teacher-specific discovery; it does not implement a general parent/student/administrator organization switcher.
- Memberships require an active linked staff profile. A school administrator must link the existing user account to the staff record.
- The picker currently displays a maximum of 100 schools and does not paginate.
- No runtime Prisma/RLS/API/device test has been executed in this environment.
