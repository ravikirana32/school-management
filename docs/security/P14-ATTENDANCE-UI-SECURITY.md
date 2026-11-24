# P14 Attendance UI Security

- Bearer token is kept in React component memory only; no browser persistence.
- API validates authentication, active school membership, entitlement and admin permission.
- Roster endpoint selects only minimum student identity fields and matching active enrollment.
- Existing API validates enrollment again on mark submission.
- Do not expose this School Admin roster endpoint to teacher/guardian clients until dedicated permission-scoped roster endpoints are implemented.
- HTTPS is required outside local development; configure `VITE_API_BASE_URL` to the deployment API origin.
