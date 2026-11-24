import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const phaseVerifiers = [
  'verify-p47-email-suppression-ui.mjs','verify-p48-suppression-key-rotation.mjs','verify-p49-notification-lifecycle.mjs',
  'verify-p50-webhook-contract.mjs','verify-p51-webhook-route-tests.mjs','verify-p52-notification-event-reconciliation.mjs',
  'verify-p53-provider-retry-policy.mjs','verify-p54-worker-lease-guards.mjs','verify-p55-notification-log-privacy.mjs',
  'verify-p56-safe-operational-events.mjs','verify-p57-suppression-pagination.mjs','verify-p58-suppression-concurrency.mjs',
  'verify-p59-notification-rate-limits.mjs','verify-p60-webhook-payload-guards.mjs','verify-p61-webhook-contract-version.mjs',
  'verify-p62-webhook-idempotency-integrity.mjs','verify-p63-provider-bounce-suppression.mjs','verify-p64-provider-release-precedence.mjs',
  'verify-p65-suppression-hash-aliases.mjs','verify-p66-suppression-key-health.mjs','verify-p67-cross-layer-suppression.mjs','verify-p68-final-readiness.mjs',
  'verify-p69-workspace-integrity.mjs','verify-p70-tenant-rls-contract.mjs','verify-p71-runtime-readiness.mjs',
  'verify-p72-payment-webhook-integrity.mjs','verify-p73-student-lifecycle.mjs','verify-p74-parent-offline-cache.mjs',
  'verify-p75-worker-shutdown.mjs','verify-p76-pdf-accessibility-boundary.mjs','verify-p77-observability.mjs',
];
let passed = 0;
for (const name of phaseVerifiers) {
  const path = `scripts/${name}`;
  assert.ok(existsSync(path), `Missing verifier ${path}`);
  const result = spawnSync(process.execPath, [path], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`Static verifier failed: ${name}`);
  }
  passed += 1;
}
const rootGaps = readFileSync('MASTER-OPEN-GAPS-REGISTER.md', 'utf8');
const docsGaps = readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md', 'utf8');
assert.equal(rootGaps, docsGaps, 'Root/docs gap register mismatch');
const gapIds = new Set([...rootGaps.matchAll(/^\| (P\d+-G\d+) \|/gm)].map(match => match[1]));
for (let phase = 69; phase <= 78; phase++) {
  for (const suffix of ['STATUS.md', 'TEST-REPORT.md', 'DELIVERY-REPORT.md']) assert.ok(existsSync(`P${phase}-${suffix}`), `Missing P${phase}-${suffix}`);
  assert.ok(existsSync(`docs/phases/P${phase}-PHASE-REPORT.md`), `Missing P${phase} phase report`);
}
console.log(`P78 consolidated static gate: ${passed}/${phaseVerifiers.length} phase verifiers PASS; ${gapIds.size} unique gap IDs; root/docs registers identical.`);
console.log('This gate does not execute TypeScript semantic checks, application tests, database/Redis integration, browser/mobile E2E or external provider sandboxes.');
