import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const failures = new Rate("school_saas_request_failures");
const latency = new Trend("school_saas_request_duration_ms", true);
const baseUrl = __ENV.K6_BASE_URL;
const healthPath = __ENV.K6_HEALTH_PATH || "/api/health/live";

export const options = {
  scenarios: { bounded_smoke: {
    executor: "constant-vus",
    vus: Number(__ENV.K6_VUS || 2),
    duration: __ENV.K6_DURATION || "30s",
    gracefulStop: "10s",
  }},
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
    school_saas_request_failures: ["rate<0.01"],
  },
};

export default function () {
  if (!baseUrl || !/^https:\/\//.test(baseUrl)) {
    throw new Error("K6_BASE_URL must be an explicit HTTPS test/staging URL");
  }
  const response = http.get(`${baseUrl.replace(/\/$/, "")}${healthPath}`, {
    tags: { endpoint: "health_live" }, timeout: "5s",
  });
  latency.add(response.timings.duration);
  const ok = check(response, {
    "health endpoint returns 2xx": (r) => r.status >= 200 && r.status < 300,
    "health response is not oversized": (r) => (r.body || "").length < 16_384,
  });
  failures.add(!ok);
  sleep(1);
}
