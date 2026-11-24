import type { Request, Response, NextFunction } from "express";

const buckets = [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];
type Metric = { count: number; durationSeconds: number; bucketCounts: number[] };
const metrics = new Map<string, Metric>();
let activeRequests = 0;
const startedAt = Date.now();
function safeLabel(value: string) { return value.replace(/[^a-zA-Z0-9_:/.-]/g, "_").slice(0, 160); }

export function requestMetricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const started = process.hrtime.bigint();
  activeRequests += 1;
  let recorded = false;
  const record = () => {
    if (recorded) return;
    recorded = true;
    activeRequests = Math.max(0, activeRequests - 1);
    const duration = Number(process.hrtime.bigint() - started) / 1e9;
    const method = safeLabel(req.method);
    const status = String(res.statusCode);
    const routePath = typeof req.route?.path === "string" ? req.route.path : "unmatched";
    const route = safeLabel(`${req.baseUrl}${routePath}` || "/");
    const key = `${method}|${status}|${route}`;
    const metric = metrics.get(key) || { count: 0, durationSeconds: 0, bucketCounts: buckets.map(() => 0) };
    metric.count += 1;
    metric.durationSeconds += duration;
    buckets.forEach((bucket, index) => { if (duration <= bucket) metric.bucketCounts[index] += 1; });
    metrics.set(key, metric);
  };
  res.once("finish", record);
  res.once("close", record);
  next();
}

export function renderRequestMetrics() {
  const lines = [
    "# HELP school_saas_http_requests_total Completed HTTP requests.",
    "# TYPE school_saas_http_requests_total counter",
    "# HELP school_saas_http_request_duration_seconds HTTP request latency distribution in seconds.",
    "# TYPE school_saas_http_request_duration_seconds histogram",
    "# HELP school_saas_http_requests_in_flight Current requests being processed.",
    "# TYPE school_saas_http_requests_in_flight gauge",
    "# HELP process_uptime_seconds Process uptime in seconds.",
    "# TYPE process_uptime_seconds gauge",
    "# HELP process_resident_memory_bytes Process resident memory in bytes.",
    "# TYPE process_resident_memory_bytes gauge",
    "# HELP nodejs_heap_size_used_bytes Node.js heap used in bytes.",
    "# TYPE nodejs_heap_size_used_bytes gauge",
  ];
  for (const [key, metric] of metrics) {
    const [method, status, route] = key.split("|");
    const labels = `method="${method}",status="${status}",route="${route}"`;
    lines.push(`school_saas_http_requests_total{${labels}} ${metric.count}`);
    buckets.forEach((bucket, index) => {
      lines.push(`school_saas_http_request_duration_seconds_bucket{${labels},le="${bucket}"} ${metric.bucketCounts[index]}`);
    });
    lines.push(`school_saas_http_request_duration_seconds_bucket{${labels},le="+Inf"} ${metric.count}`);
    lines.push(`school_saas_http_request_duration_seconds_sum{${labels}} ${metric.durationSeconds.toFixed(6)}`);
    lines.push(`school_saas_http_request_duration_seconds_count{${labels}} ${metric.count}`);
  }
  const memory = process.memoryUsage();
  lines.push(`school_saas_http_requests_in_flight ${activeRequests}`);
  lines.push(`process_uptime_seconds ${((Date.now() - startedAt) / 1000).toFixed(3)}`);
  lines.push(`process_resident_memory_bytes ${memory.rss}`);
  lines.push(`nodejs_heap_size_used_bytes ${memory.heapUsed}`);
  return `${lines.join("\n")}\n`;
}

export function resetRequestMetricsForTests() { metrics.clear(); activeRequests = 0; }
