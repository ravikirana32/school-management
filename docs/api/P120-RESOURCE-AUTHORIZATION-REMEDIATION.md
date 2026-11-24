# P120 — Resource Authorization Remediation

## Admissions permission model

Every admissions route first requires active school membership. Read routes require `admissions.read`; mutation routes require `admissions.manage`. This replaces the previous blanket school-administrator gate and allows the permission catalog/role assignments to govern admissions access consistently.

## Identity RLS context

Access member and role-assignment views derive user IDs from the active school membership or assignment set, then retrieve only those user profile rows within `withIdentityContext` for the authenticated user. Organization listing similarly retrieves organization rows inside the authenticated identity context after deriving organization IDs from active memberships.

## Existing reviewed patterns retained

- Student and staff modules combine active membership with explicit school permission checks.
- Admissions object reads/writes include organization and school predicates inside tenant context.
- Timetable administration requires active membership plus school-admin access or `academics.manage`; the teacher self-service timetable is limited to the linked active teacher's assignments.
- Platform routes are mounted behind `authenticate` and `requirePlatformAdmin`.

## Limitations

This is a targeted remediation, not a complete handler-by-handler security certification. Remaining review must cover every resource ownership predicate, all tenant-scoped queries, background workers, internal callbacks, RLS policy behavior under the deployment DB role, and cross-tenant negative tests.
