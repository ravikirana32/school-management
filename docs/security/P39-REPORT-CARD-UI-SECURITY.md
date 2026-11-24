# P39 report-card UI security

- School Admin screens are permission-gated in navigation and actions (`reports.read`, `reports.manage`, `reports.approve`).
- All API operations continue to enforce active membership and tenant-scoped Prisma transactions.
- Approval author separation and rejection reason validation are enforced by the API, not merely the UI.
- Parent app downloads only through the P38 portal endpoint, which verifies active school membership, accepted non-withdrawn consent, linked guardian/student and published report state.
- Signed URLs expire after 60 seconds. A URL already issued may remain usable until expiry after consent is withdrawn; use very short expiry and private bucket policy.
- Do not treat board keys as proof of affiliation, official syllabus compliance or regulator endorsement.
