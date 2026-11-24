import { readFileSync, existsSync } from 'node:fs';
const script = readFileSync('scripts/verify-p365-runtime-contract.mjs', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const ci = readFileSync('scripts/verify-c2-01-ci-source.mjs', 'utf8');
const checks = [
 ['runtime verifier file exists', existsSync('scripts/verify-p365-runtime-contract.mjs')],
 ['checks Node engine constraint', /Root Node engine contract/.test(script)],
 ['checks root pnpm pin', /Root package manager pin/.test(script)],
 ['checks both container files', /Dockerfile\.api/.test(script) && /Dockerfile\.web/.test(script)],
 ['checks Node 22 images and pnpm Corepack pin', /Node 22 base image/.test(script) && /Corepack pnpm 9\.15\.0/.test(script)],
 ['root command registered', pkg.scripts?.['verify:p365'] === 'node scripts/verify-p365-runtime-contract.mjs'],
 ['CI source gate includes P365 verifier', /verify-p365-runtime-contract\.mjs/.test(ci)],
];
let pass=0; for (const [name,ok] of checks) { console.log(`${ok?'PASS':'FAIL'} ${name}`); if(ok) pass++; }
console.log(`P365 verifier contract: ${pass}/${checks.length} PASS`); if(pass!==checks.length) process.exit(1);
