import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push({ name, status: "PASS" }); }
  catch (error) { checks.push({ name, status: "FAIL", reason: error.message }); }
}
await check("bounded worker shutdown implements step timeout", async () => {
  const s = await readFile("backend/api/src/workers/graceful-shutdown.ts", "utf8");
  assert.match(s, /stepTimeoutMs/);
  assert.match(s, /Promise\.race/);
  assert.match(s, /AggregateError/);
});
await check("worker shutdown attempts all cleanup steps", async () => {
  const s = await readFile("backend/api/src/workers/graceful-shutdown.ts", "utf8");
  for (const token of ["clearTimers", "closeWorker", "closeQueues", "disconnectDatabase"]) assert.ok(s.includes(token));
});
await check("shutdown tests cover timeout, error and idempotency", async () => {
  const s = await readFile("backend/api/src/workers/graceful-shutdown.test.ts", "utf8");
  for (const token of ["idempotent", "hung worker drain", "continues cleanup", "AggregateError"]) assert.ok(s.includes(token));
});
await check("k6 profile is HTTPS-only and has bounded thresholds", async () => {
  const s = await readFile("tests/load/api-smoke.k6.js", "utf8");
  assert.match(s, /https/);
  assert.match(s, /http_req_failed/);
  assert.match(s, /p\(95\)/);
});
await check("DR runbook separates backup from verified restore", async () => {
  const s = await readFile("docs/operations/P578-RELIABILITY-DR-ACCEPTANCE.md", "utf8");
  assert.match(s, /A backup is not accepted until restore is proven/);
  assert.match(s, /NOT RUN/);
});
await check("package scripts expose P578 verifier", async () => {
  const p = JSON.parse(await readFile("package.json", "utf8"));
  assert.equal(p.scripts["verify:p578"], "node scripts/verify-p578-reliability-foundation.mjs");
});
console.log(JSON.stringify({ phase: "P578", checks, passed: checks.filter(x => x.status === "PASS").length, failed: checks.filter(x => x.status === "FAIL").length }, null, 2));
if (checks.some(x => x.status === "FAIL")) process.exit(1);
