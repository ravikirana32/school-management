import { spawnSync } from 'node:child_process';
const checks = [
  ['TypeScript/TSX syntax scan', ['scripts/check-source-syntax.mjs']],
  ['Workspace manifest audit', ['scripts/verify-c2-01-package-manifests.mjs']],
  ['Domain invariant tests', ['--test', 'packages/domain-rules/test/*.test.mjs']],
  ['P80-P108 source contract', ['scripts/verify-p80-p108-remediation.mjs']],
  ['Documentation and gap-register mirror parity', ['scripts/verify-c2-01-register-mirrors.mjs']],
  ['CI workflow contract audit', ['scripts/verify-c2-01-ci-workflow.mjs']],
  ['P364 bootstrap diagnostics contract', ['scripts/verify-p364-bootstrap-diagnostics.mjs']],
  ['P365 container runtime contract', ['scripts/verify-p365-runtime-contract.mjs']],
  ['P365 verifier contract', ['scripts/verify-p365-contract-verifier.mjs']],
  ['P366 stabilization closure contract', ['scripts/verify-p366-stabilization-closure.mjs']],
  ['P366 verifier self-contract', ['scripts/verify-p366-contract-verifier.mjs']],
  ['P367 C2-02 audit contract', ['scripts/verify-c2-02-audit-contract.mjs']],
  ['P368 C2-03 auth/security audit', ['scripts/audit-c2-03-auth-security.mjs']],
  ['P368 C2-03 audit contract', ['scripts/verify-c2-03-audit-contract.mjs']],
  ['P369 C2-03 RBAC/authorization source audit', ['scripts/audit-c2-03-rbac-authorization.mjs']],
  ['P369 C2-03 RBAC audit contract', ['scripts/verify-c2-03-rbac-audit-contract.mjs']],
];
let passed = 0;
for (const [label, args] of checks) {
  const isTest = args[0] === '--test';
  const actual = isTest ? ['--test', ...args.slice(1)] : args;
  const result = spawnSync(process.execPath, actual, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, shell: isTest });
  if (result.status === 0) {
    passed++;
    console.log(`PASS ${label}`);
  } else {
    console.error(`FAIL ${label} (exit ${result.status})`);
    if (result.stdout) console.error(result.stdout.trim());
    if (result.stderr) console.error(result.stderr.trim());
  }
}
console.log(`C2-01 dependency-free CI source gate: ${passed}/${checks.length} PASS`);
if (passed !== checks.length) process.exit(1);
