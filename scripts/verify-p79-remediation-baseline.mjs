import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const source = readFileSync('backend/api/src/modules/auth/auth.routes.ts', 'utf8');
assert.match(source, /authRouter\.get\("\/me",\s*authenticate/);
const result = spawnSync(process.execPath, ['scripts/verify-p79-auth-me.mjs'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || result.stdout);
const root = readFileSync('MASTER-OPEN-GAPS-REGISTER.md', 'utf8');
const mirror = readFileSync('docs/MASTER-OPEN-GAPS-REGISTER.md', 'utf8');
assert.equal(root, mirror);
const ids = new Set([...root.matchAll(/^\| (P\d+-G\d+) \|/gm)].map(x => x[1]));
assert.ok(ids.size >= 474, `Expected at least the P79 baseline gap IDs, got ${ids.size}`);
assert.ok(root.includes("P359-G001") && root.includes("P359-G007"), "C2-01 gaps must be carried into the current register");
for (let phase = 79; phase <= 79; phase++) {
  for (const suffix of ['STATUS.md', 'TEST-REPORT.md', 'DELIVERY-REPORT.md']) assert.ok(readFileSync(`P${phase}-${suffix}`, 'utf8').length > 0);
}
const roadmap = readFileSync('docs/REMEDIATION-ROADMAP-P79-P108.md', 'utf8');
for (let phase = 79; phase <= 108; phase++) assert.match(roadmap, new RegExp(`P${phase}\\s*\\|`));
console.log(`P79 remediation baseline: auth contract PASS; root/docs mirror PASS; ${ids.size} cumulative gap IDs; P79-P108 roadmap PASS`);
