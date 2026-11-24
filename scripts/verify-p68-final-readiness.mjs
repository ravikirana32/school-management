import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const verifiers = Array.from({ length: 21 }, (_, index) => `scripts/verify-p${index + 47}-${[
  'email-suppression-ui','suppression-key-rotation','notification-lifecycle','webhook-contract','webhook-route-tests','notification-event-reconciliation','provider-retry-policy','worker-lease-guards','notification-log-privacy','safe-operational-events','suppression-pagination','suppression-concurrency','notification-rate-limits','webhook-payload-guards','webhook-contract-version','webhook-idempotency-integrity','provider-bounce-suppression','provider-release-precedence','suppression-hash-aliases','suppression-key-health','cross-layer-suppression'
][index]}.mjs`);
let passed = 0;
for (const verifier of verifiers) {
  if (!existsSync(verifier)) throw new Error(`Missing phase verifier: ${verifier}`);
  const result = spawnSync(process.execPath, [verifier], { encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    throw new Error(`Verifier failed: ${verifier}`);
  }
  const lastLine = (result.stdout || '').trim().split('\n').at(-1) || 'PASS';
  console.log(`${verifier}: ${lastLine}`);
  passed += 1;
}
const rootGaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const docsGaps = read('docs/MASTER-OPEN-GAPS-REGISTER.md');
assert.equal(rootGaps, docsGaps, 'Root and docs master gap registers differ');
const uniqueGapIds = new Set([...rootGaps.matchAll(/^\| (P\d+-G\d+) \|/gm)].map(match => match[1]));
assert.ok(uniqueGapIds.size > 0, 'No gap IDs found');
for (let phase = 47; phase <= 67; phase++) {
  const required = ['PHASE-REPORT.md', 'ARTIFACT-MANIFEST.json', phase === 49 ? 'NOTIFICATION-LIFECYCLE-ACCEPTANCE.md' : 'TEST-PLAN.md'];
  for (const suffix of required) {
    const path = `docs/phases/P${phase}-${suffix}`;
    assert.ok(existsSync(path), `Missing phase artifact: ${path}`);
  }
}
assert.ok(existsSync('docs/phases/P67-END-TO-END-REGRESSION-MATRIX.md'));
assert.ok(existsSync('docs/security/P66-SUPPRESSION-KEY-RETIREMENT-RUNBOOK.md'));
console.log(`P68 final verifier: ${passed}/${verifiers.length} phase verifiers PASS; ${uniqueGapIds.size} unique gap IDs; root/docs registers identical`);
