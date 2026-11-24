# P105 Metrics, Trace Context and Alerting

## Metrics
- Authenticated endpoint: `/internal/metrics`.
- Prometheus metrics: request counters by bounded method/status/route labels; latency histogram buckets; in-flight requests; process uptime, RSS and heap usage.
- Prometheus rules cover API scrape availability, 5xx rate, p95 latency and process memory.
- Grafana provisions API request rate, 5xx rate, p95 latency, memory, in-flight requests and uptime panels.

## Trace context
- Middleware validates W3C `traceparent`, generates trace/span IDs when absent, propagates a child `traceparent` response header and `X-Request-ID`.
- Pino HTTP logs include request, trace, span and parent span IDs.
- This is context propagation and log correlation only; it does not create/export OpenTelemetry spans.

## Alerting
- Alertmanager groups and routes firing/resolved alerts to the configured `ALERT_WEBHOOK_URL`.
- Prometheus/Grafana/Alertmanager ports bind to loopback by default.
- Receiver availability and actual notification delivery must be verified after deployment.
