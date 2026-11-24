# P475 — Parent Mobile Academic Planner

## Implemented client journey
- Parent can open the Academic Planner from the selected child dashboard.
- Day/week view navigation, previous/next period and Today reset.
- Displays timetable, school-calendar events and published exams as separate sections.
- Refresh action and busy/error/empty states.
- Component resets when child context changes; it only uses the selected student's scoped request path.
- Offline mode is read-only and shows an explicit no-cached-planner notice instead of stale/other-child data.

## Intended parent-scoped API contract (backend implementation not verified)
The component currently requests:
- `GET /parents/:organizationId/:schoolId/portal/children/:studentId/timetable?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /parents/:organizationId/:schoolId/portal/children/:studentId/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `GET /parents/:organizationId/:schoolId/portal/children/:studentId/exams?from=YYYY-MM-DD&to=YYYY-MM-DD`

These routes must enforce verified guardian relationship, active school membership, consent, publication visibility, tenant/school/student ownership, date-range limits, and RLS. API route existence, response schema, runtime behavior, and authorization are **not verified in P475**; a missing endpoint is surfaced in the UI error state rather than treated as an empty success.

## Verification
P475 source verifier checks component existence, app integration, child scope in all endpoint paths, navigation, distinct sections, loading/error/empty/offline handling, and that endpoint routes are documented as unverified contracts. Typecheck and mobile runtime are not asserted by static verification.
