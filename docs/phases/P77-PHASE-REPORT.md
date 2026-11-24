# P77 — API Request Observability

## Delivered
- HTTP request count and duration metrics grouped by method/status/Express route template.
- Safe route-template labels, not raw paths or query strings.
- Optional bearer-protected Prometheus text endpoint.
- Unit-test source and static verifier.

## Acceptance still required
- Run Vitest and verify labels with dynamic identifiers.
- Verify unauthorized/unconfigured metrics endpoint is not exposed.
- Restrict metrics endpoint at ingress/network layer and rotate token through secrets manager.
- Configure central Prometheus scraping, multi-replica aggregation, alert rules, retention and dashboards.
- Add distributed tracing and structured correlation across API/worker boundaries.
