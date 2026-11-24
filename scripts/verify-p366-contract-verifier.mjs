import { readFileSync, existsSync } from 'node:fs';
const script = readFileSync('scripts/verify-p366-stabilization-closure.mjs', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const gate = readFileSync('scripts/verify-c2-01-ci-source.mjs', 'utf8');
const checks = [
 ['P366 verifier exists', existsSync('scripts/verify-p366-stabilization-closure.mjs')],
 ['verifier checks CI source gate', script.includes('Dependency-free CI source gate is registered')],
 ['verifier checks lockfile blocker', script.includes('Lockfile blocker is explicit and not bypassed')],
 ['verifier checks runtime/build acceptance steps', script.includes('Dependency/runtime acceptance steps are represented')],
 ['root script registered', pkg.scripts?.['verify:p366'] === 'node scripts/verify-p366-stabilization-closure.mjs'],
 ['CI source gate includes P366 verifier', gate.includes('verify-p366-stabilization-closure.mjs')],
];
let pass = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (ok) pass++; }
console.log(`P366 verifier contract: ${pass}/${checks.length} PASS`);
if (pass !== checks.length) process.exit(1);
