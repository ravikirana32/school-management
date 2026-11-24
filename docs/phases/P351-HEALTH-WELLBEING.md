# P351 — Health & Wellbeing (Cycle 1)

## Basic functionality delivered
- School-scoped student medical profiles: blood group, allergies, conditions, medication notes, emergency medical notes.
- Student health event history: health visit, medication, injury, incident, other; details, treatment and medication notes.
- Authenticated school-scoped APIs for profile read/upsert, event list/create, school event list.
- Health permission checks (`health.read`, `health.manage`), active school membership and school/organization scoped student checks.
- School Admin navigation and Health Workspace UI for profile editing, event recording and history.
- Staff Mobile Health panel to load profiles/events and record a health visit.
- Parent Mobile health view for the active selected child, served by a guardian-link + accepted consent + active membership + parent health permission gated API.
- Prisma schema and SQL migration, seed permissions for Health Manager access and Parent read access.

## API
- GET/PUT `/:organizationId/:schoolId/health/students/:studentId/profile`
- GET/POST `/:organizationId/:schoolId/health/students/:studentId/events`
- GET `/:organizationId/:schoolId/health/events`
- Parent GET `/:organizationId/:schoolId/portal/health` (only accepted, verified, consented guardian-linked students)

## Verification status
- P351 source verifier: 12/12 PASS.
- Dependencies are not installed in the working copy; Prisma generation, runtime migration, API tests, web/mobile typecheck/build and device validation were not run.

## Open Cycle 1 gaps carried forward
- Parent notification delivery and incident escalation are not triggered by health event creation.
- Student self-view/consent policy not implemented.
- Dedicated nurse/health-worker role granularity not implemented.

## Cycle 2
- Runtime DB/API, tenant isolation, security review, automated E2E/regression, builds and device validation.
- Structured medication administration scheduling, attachment handling and advanced incident workflows.
