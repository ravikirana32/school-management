# P26 — School Configuration Persistence

## Scope delivered

The School Admin workspace now uses authenticated, tenant-scoped APIs for five previously preview-only areas:

- School profile: load and update `/profile`.
- Academic years: list existing years and create a new year through `/academic-years`.
- Calendar: list/create calendars and list/create events.
- Working days: load and replace the weekly day configuration.
- Policies: load and update versioned attendance and grading policy values.

The workspace uses the shared `SchoolAdminSession` request helper, so bearer authentication and one-time refresh-on-401 behavior are shared with the rest of the School Admin app. It never stores tokens in browser storage. The API mutation guards were changed from a blanket School Admin role check to the relevant `school.settings.manage` or `academics.manage` permission.

## Guardrails

- UI save controls are permission-gated. The API remains authoritative and enforces active membership and administrator authorization.
- All requests include the selected organization and school scope in the URL; the server derives actor identity from the authenticated token and verifies membership.
- Academic-year creation is subject to the existing academic-configuration entitlement.
- Calendar event date/time values are converted to ISO timestamps before submission.
- Failed API requests leave the form editable and surface the server error.
- Academic year and term date schemas now reject impossible dates such as February 30, not just malformed date strings.

## Explicit limitations

- Curriculum, students, staff and access screens remain preview-only in P26.
- Academic year creation is implemented; academic-year edit/retire and term management UI are not included.
- Calendar event edit/delete, recurring events, imports and holiday sync are not included.
- School profile logo upload and address normalization are not included.
- Working-day changes do not yet run a conflict/holiday impact preview.
- Policy values are limited to the schema currently supported by the API.
