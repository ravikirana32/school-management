# P15 Teacher Attendance Security

- Teacher attendance operations require active school membership and the `attendance.mark` permission.
- Staff profile must be linked to the authenticated user and active.
- Assignment must match organization, school, academic year, grade and section; assignment start/end dates are enforced.
- Teacher roster endpoint returns only active students enrolled in the exact session class and minimal student identity fields.
- Teachers cannot lock sessions; locking remains an administrator operation.
- Mobile bearer token is memory-only; do not use cleartext HTTP outside local development.

Outstanding: secure credential storage/auth refresh, mobile device posture, offline queue conflict policy, privacy review and runtime integration tests.
