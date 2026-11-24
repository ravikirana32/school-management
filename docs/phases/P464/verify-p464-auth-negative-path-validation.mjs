import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd().endsWith('backend/api') ? path.resolve(process.cwd(), '../..') : process.cwd();
const testPath = path.join(root, 'backend/api/src/modules/auth/auth.validation.integration.test.ts');
const packagePath = path.join(root, 'backend/api/package.json');
const source = fs.readFileSync(testPath, 'utf8');
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const checks = [
  ['Vitest and Supertest imports', source.includes('from "vitest"') && source.includes('from "supertest"')],
  ['actual Express app imported', source.includes('from "../../../app.js"')],
  ['invalid registration email covered', source.includes('invalid email before persistence')],
  ['short registration password covered', source.includes('short password')],
  ['strict registration payload covered', source.includes('unknown property because the schema is strict')],
  ['missing login email covered', source.includes('email is missing')],
  ['missing login password covered', source.includes('password is missing')],
  ['strict login payload covered', source.includes('login with unknown fields')],
  ['short refresh token covered', source.includes('shorter than the contract minimum')],
  ['strict refresh payload covered', source.includes('refresh payloads with unknown fields')],
  ['missing reset token covered', source.includes('password reset when token is missing')],
  ['short reset token covered', source.includes('password reset with a short token')],
  ['short reset password covered', source.includes('password is below the minimum length')],
  ['phase verifier registered', pkg.scripts?.['verify:p464'] === 'node ../../scripts/verify-p464-auth-negative-path-validation.mjs'],
  ['integration test script remains Vitest', pkg.scripts?.test === 'vitest run'],
];
let pass = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (ok) pass++; }
console.log(`P464 source verifier: ${pass}/${checks.length}`);
if (pass !== checks.length) process.exit(1);
