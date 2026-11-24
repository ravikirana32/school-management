# P26 — School Configuration Security

- Client calls are authenticated through the shared School Admin session provider.
- Organization and school identifiers are URL scope selectors only; the API verifies active membership before data access.
- Tenant database operations use the existing tenant context wrapper.
- Mutation authorization is enforced server-side using `school.settings.manage` for profile/working-day/policy writes and `academics.manage` for academic-year/term/calendar/event writes. UI permission checks are usability controls, not security boundaries.
- Academic year and term date-only schemas validate real Gregorian calendar dates.
- No access token or refresh token is persisted to localStorage, sessionStorage or IndexedDB by this phase.
- Personal/school profile fields are not copied to analytics or browser persistence.
- Production acceptance still requires non-owner PostgreSQL RLS tests, authorization integration tests, CSRF/CORS review and browser E2E.
