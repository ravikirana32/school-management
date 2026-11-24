# P77 Status — API Request Observability

**Status: SOURCE FOUNDATION DELIVERED; SCRAPE/PRODUCTION ACCEPTANCE PENDING**

- Added bounded-label HTTP request counters and duration sums using Express route templates, method and status.
- Raw URL/query parameters are not used as metric labels.
- Added an optional `/internal/metrics` Prometheus text endpoint protected by a 32+ character bearer token and constant-time comparison; endpoint returns 404 when unconfigured or unauthorized.
- Added tests for route-template labels and Prometheus output.

Limitations: counters are process-local (not aggregated across replicas), no persistent metrics backend/alerts/traces, no scrape network ACL is configured by source, and the test suite was not executed.
