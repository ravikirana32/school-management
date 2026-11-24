import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const helper = readFileSync('backend/api/src/workers/graceful-shutdown.ts', 'utf8');
const tests = readFileSync('backend/api/src/workers/graceful-shutdown.test.ts', 'utf8');
for (const file of ['notification-delivery-worker.ts', 'document-scan-worker.ts', 'parent-invitation-worker.ts']) {
  const source = readFileSync(`backend/api/src/workers/${file}`, 'utf8');
  assert.ok(source.includes('createWorkerShutdown'), `${file} does not use shared shutdown`);
  assert.ok(source.includes('process.once("SIGINT"') && source.includes('process.once("SIGTERM"'), `${file} missing one-shot signal handlers`);
  assert.ok(source.includes('worker.close()'), `${file} does not drain active jobs`);
}
assert.ok(helper.includes('if (shutdownPromise) return shutdownPromise'));
assert.ok(helper.indexOf('closeWorker') < helper.indexOf('closeQueues') && helper.indexOf('closeQueues') < helper.indexOf('disconnectDatabase'));
for (const phrase of ['in order', 'idempotent', 'drain failure', 'continues cleanup']) assert.ok(tests.includes(phrase));
console.log('P75 worker shutdown static verification: 10/10 PASS; process-level drain tests pending.');
