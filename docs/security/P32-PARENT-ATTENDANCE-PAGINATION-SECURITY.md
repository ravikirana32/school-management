# P32 Parent Attendance Pagination Security

- Every page re-runs parent authorization; pagination state is never treated as authorization.
- Authorization requires active organization and school membership, PARENT role and `parent.attendance.read`, a verified active guardian, accepted non-withdrawn invitation consent, and a communications-enabled guardian/student link.
- Cursor lookup is constrained by the exact same tenant, student, published-session and date filter as the result query. Foreign or stale/out-of-filter cursors are rejected.
- `limit` is bounded to 100. Stable tie-breaking uses row ID after marked timestamp.
- Only submitted/locked attendance rows are returned; remarks and private teacher comments are excluded.
- Parent app stores pagination state in memory only and clears it on school change, consent withdrawal and sign-out.
- Remaining risks: mutable attendance corrections can alter page membership between requests; production acceptance should test correction races and consider a snapshot watermark if the product requires immutable pagination.
