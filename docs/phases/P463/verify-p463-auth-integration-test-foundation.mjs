import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd().endsWith('backend/api') ? path.resolve(process.cwd(), '../..') : process.cwd();
const testFile = path.join(root, 'backend/api/src/modules/auth/auth.integration.test.ts');
const packageFile = path.join(root, 'backend/api/package.json');
const testSource = fs.readFileSync(testFile, 'utf8');
const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
const assertions = [
  ['uses Vitest', testSource.includes('from "vitest"')],
  ['uses Supertest', testSource.includes('from "supertest"')],
  ['targets actual Express app', testSource.includes('from "../../../app.js"')],
  ['invalid login contract', testSource.includes('malformed login input') && testSource.includes('status).toBe(400')],
  ['invalid refresh contract', testSource.includes('malformed refresh input') && testSource.includes('status).toBe(401')],
  ['forgot-password generic response', testSource.includes('generic forgot-password response') && testSource.includes('status).toBe(202')],
  ['safe logout contract', testSource.includes('malformed logout input safely') && testSource.includes('status).toBe(204')],
  ['anonymous session protection', testSource.includes('session inventory from anonymous requests')],
  ['anonymous MFA status protection', testSource.includes('MFA status from anonymous requests')],
  ['test command available', pkg.scripts?.test === 'vitest run'],
  ['verify script registered', pkg.scripts?.['verify:p463'] === 'node ../../scripts/verify-p463-auth-integration-test-foundation.mjs'],
];
let passed = 0;
for (const [name, ok] of assertions) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (ok) passed++; }
console.log(`P463 source verifier: ${passed}/${assertions.length}`);
if (passed !== assertions.length) process.exit(1);
