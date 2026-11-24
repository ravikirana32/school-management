# P44 acceptance plan

1. Sign in as a school administrator with `school.settings.manage`; upload PNG and JPEG files at the 5 MiB boundary and verify direct-to-private-S3 presigned POST.
2. Confirm metadata mismatch, oversize, unsupported MIME, failed scan and rejected scan never activate a logo; confirm CLEAN promotion enables signed retrieval and PDF embedding.
3. Verify no browser/API response exposes private object keys or long-lived URLs.
4. Run two or more API replicas against one Redis and verify the 31st request in one 60-second IP window receives 429; verify a new window resets the counter.
5. Stop Redis and verify public verification returns 503 (fail closed), not a local fallback.
6. Validate reverse-proxy trusted-IP configuration and test spoofed forwarding headers.
7. Run Playwright for logo upload/status/refresh and mobile PDF rendering; run S3/scanner integration and non-owner PostgreSQL RLS tests.
8. Arabic RTL shaping, PDF accessibility, email receipts/bounces/complaints and PUSH remain separately open.
