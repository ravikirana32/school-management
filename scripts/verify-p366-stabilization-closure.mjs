import { readFileSync, existsSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
const sourceGate = readFileSync('scripts/verify-c2-01-ci-source.mjs', 'utf8');
const bootstrap = readFileSync('scripts/diagnose-c2-01-bootstrap.mjs', 'utf8');
const checks = [
  ['C2-01 stabilization master scope exists', existsSync('FINAL-DETAILS-ALL-FEATURES.md')],
  ['Active and open gap registers exist', existsSync('MASTER-ACTIVE-GAPS-REGISTER.md') && existsSync('MASTER-OPEN-GAPS-REGISTER.md')],
  ['Dependency-free CI source gate is registered', pkg.scripts?.['verify:c2-01:ci-source'] === 'node scripts/verify-c2-01-ci-source.mjs' && sourceGate.includes('verify-p365-runtime-contract.mjs')],
  ['CI source-only job is present', ci.includes('source-only-gates') && ci.includes('verify-c2-01-ci-source.mjs')],
  ['CI frozen install requirement is explicit', ci.includes('pnpm install --frozen-lockfile')],
  ['Lockfile blocker is explicit and not bypassed', ci.includes('pnpm-lock.yaml is missing') && bootstrap.includes('pnpm-lock.yaml')],
  ['Dependency/runtime acceptance steps are represented', ci.includes('Generate Prisma client') && ci.includes('Build API and all nine applications') && ci.includes('Typecheck API and all nine applications') && ci.includes('@school-saas/driver-mobile build') && ci.includes('Validate production Compose configuration')],
  ['Mobile app workspace checks remain in source gate', sourceGate.includes('Workspace manifest audit')],
  ['C2-02 acceptance boundary documented', readFileSync('FINAL-DETAILS-ALL-FEATURES.md', 'utf8').includes('C2-02')],
];
let pass = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (ok) pass++; }
console.log(`P366 C2-01 stabilization closure contract: ${pass}/${checks.length} PASS`);
if (pass !== checks.length) process.exit(1);
