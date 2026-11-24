# P06 — School Configuration and Academic Calendar

## Delivered source
- School profile with legal/display identity, board key, affiliation, contact/address, locale, timezone, currency, date format and week start.
- Academic years with date bounds, lifecycle and one-current-year-per-school database constraint.
- Academic terms/semesters/quarters with sequence and date validation.
- Multiple school calendars, optional academic-year association and one default calendar per school.
- Calendar events for holidays, school events, exams, parent meetings, staff events and closures; audience and instructional-day flags.
- Working-day configuration for Sunday–Saturday with opening/closing times.
- Versioned attendance and grading policy JSON records.
- School-scoped RLS policies and composite school/organization foreign keys.\n- School Admin local configuration preview for profile, academic year, calendar, working days and policy sections; API persistence is not wired yet.
- `academicConfiguration` plan entitlement added to all seeded tiers; academic-year creation checks the entitlement.
- School member reads and school-admin mutations.

## API
Base path `/api/v1/schools`:
- `GET /:organizationId/:schoolId/profile`
- `PUT /:organizationId/:schoolId/profile`
- `GET /:organizationId/:schoolId/academic-years`
- `POST /:organizationId/:schoolId/academic-years`
- `POST /:organizationId/:schoolId/academic-years/:academicYearId/terms`
- `GET /:organizationId/:schoolId/calendars`
- `POST /:organizationId/:schoolId/calendars`
- `GET /:organizationId/:schoolId/calendars/:calendarId/events`
- `POST /:organizationId/:schoolId/calendars/:calendarId/events`
- `GET /:organizationId/:schoolId/working-days`
- `PUT /:organizationId/:schoolId/working-days`
- `GET /:organizationId/:schoolId/policies`
- `PUT /:organizationId/:schoolId/policies`

## Scope and security
All route operations verify active school membership. Mutations require the SCHOOL_ADMIN role assignment. All reads/writes against the new school configuration tables execute inside `withTenantContext` and use transaction-local organization/school context. The database migration forces RLS on every P06 table.

## Known limitations
- School profile logo field stores an object key only; upload and private-object lifecycle are not implemented.
- Board key is configurable text, not a validated board/curriculum catalogue.
- Academic-year creation is entitlement checked; other P06 mutations are not yet individually feature-gated.
- Academic year/term overlap checks and transactional race behavior require further hardening.
- Holiday recurrence, import/export, timetable integration and calendar synchronization are pending.
- Attendance and grading policies are configuration records only; later attendance/exam modules must consume and validate them.
- Localized date formatting and timezone edge-case tests remain pending.
