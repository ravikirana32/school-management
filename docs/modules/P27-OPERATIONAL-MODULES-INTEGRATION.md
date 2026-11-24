# P27 — Operational Modules API Integration

## Scope
P27 replaces the local-only School Admin previews for curriculum, student, staff and access administration with a shared authenticated API workspace. All requests use `SchoolAdminSession.request`, which supplies the bearer token and performs the existing single-flight refresh/retry behavior. Organization and school scope are taken from the active membership context, never from user-editable text fields.

## Curriculum
- Reads the board catalogue, current board profile, grade levels and curriculum versions.
- Saves board profile and creates grade levels and curriculum versions.
- Curriculum version creation uses the currently selected academic year when available.
- Official board affiliation and syllabus correctness are not certified by the catalogue.

## Students
- Reads paginated student summaries with bounded search.
- Creates student admission records using the existing Zod-validated API.
- The list renders only the API's summary fields; it does not fetch full student/guardian detail for the table.
- Guardian editing, enrollment, pickup contacts, document upload and field-level PII masking remain future work.

## Staff
- Reads staff summaries, departments, designations and teacher assignments.
- Creates staff records and teacher assignments for the selected academic year.
- Assignment currently uses school-scoped IDs; searchable grade/staff pickers and assignment lifecycle editing remain future work.
- Department/designation writes, account linking and document metadata remain API-only in this workspace.

## Access administration
- Reads school roles and the permission catalogue.
- Creates school-scoped custom roles from known permission keys.
- Assigns an existing school role to an existing school member by IDs.
- Searchable member picker, assignment listing/revocation UI and assignment audit view remain future work.

## Authorization boundary
The UI hides modules without the required capability. Backend authorization remains authoritative. Existing student, staff and access route families still require active School Admin membership in several operations; granular permission adoption is not complete. Curriculum read routes require active membership and mutations also enforce School Admin access plus subscription entitlement. Do not treat UI visibility as proof of API permission.

## Runtime status
Source and static syntax checks only. No package install, full typecheck, browser build, API integration, PostgreSQL/RLS run or Playwright test was executed for P27.
