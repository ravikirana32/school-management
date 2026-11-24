import { readFileSync, existsSync } from 'node:fs';
const script = readFileSync('scripts/diagnose-c2-01-bootstrap.mjs', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const ciSource = readFileSync('scripts/verify-c2-01-ci-source.mjs', 'utf8');
const checks = [
  ['bootstrap diagnostics script exists', existsSync('scripts/diagnose-c2-01-bootstrap.mjs')],
  ['diagnostics checks Node major', /Node\.js major version/.test(script)],
  ['diagnostics checks declared package manager', /Root packageManager declaration/.test(script)],
  ['diagnostics checks lockfile and pnpm availability/version', /pnpm lockfile/.test(script) && /pnpm executable/.test(script) && /pnpm version/.test(script)],
  ['diagnostics avoid exposing registry credentials', !/npmrc.*password|authToken|_auth/.test(script)],
  ['root package exposes diagnostic command', packageJson.scripts?.['diagnose:c2-01:bootstrap'] === 'node scripts/diagnose-c2-01-bootstrap.mjs'],
  ['CI source gate includes P364 verifier', /verify-p364-bootstrap-diagnostics\.mjs/.test(ciSource)],
];
let passed = 0;
for (const [label, ok] of checks) { if (ok) { passed++; console.log(`PASS ${label}`); } else console.error(`FAIL ${label}`); }
console.log(`P364 bootstrap diagnostics contract: ${passed}/${checks.length} PASS`);
if (passed !== checks.length) process.exit(1);
