# P14 — Attendance UI Integration

P14 adds a connected attendance workspace to the School Admin app. It accepts API base URL, bearer access token, organization ID and school ID in an in-memory form. The token is not persisted to localStorage/sessionStorage.

The workflow:
1. Load attendance sessions for a date.
2. Create a session using academic year, grade, section and date IDs.
3. Open a draft session.
4. Load a roster composed only of active students with an ENROLLED record matching the session year/grade/section.
5. Mark statuses and remarks, save the batch.
6. Submit and lock the session.

The roster API is administrator-only because the current student module still restricts student data to School Admin. Teacher mobile UX and granular teacher roster read are future work.
