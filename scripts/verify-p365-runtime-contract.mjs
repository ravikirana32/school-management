import { readFileSync, existsSync } from 'node:fs';
const files = ['Dockerfile.api', 'Dockerfile.web'];
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const checks = [];
function add(label, ok, detail) { checks.push({label, ok, detail}); }
add('Root Node engine contract', root.engines?.node === '>=22 <23', `package.json engines.node=${root.engines?.node ?? '(missing)'}`);
add('Root package manager pin', root.packageManager === 'pnpm@9.15.0', `packageManager=${root.packageManager ?? '(missing)'}`);
for (const file of files) {
  const exists = existsSync(file);
  const text = exists ? readFileSync(file, 'utf8') : '';
  add(`${file} exists`, exists, exists ? 'present' : 'missing');
  add(`${file} uses Node 22 base image`, /FROM\s+node:22(?:[-\w.]*)/i.test(text), 'expected Node 22 image stage(s)');
  add(`${file} pins pnpm 9.15.0 via Corepack`, /corepack\s+prepare\s+pnpm@9\.15\.0\s+--activate/.test(text), 'expected Corepack pnpm 9.15.0 activation');
}
const failed = checks.filter(c => !c.ok).length;
for (const c of checks) console.log(`${c.ok ? 'PASS' : 'FAIL'} ${c.label}: ${c.detail}`);
console.log(`P365 container runtime contract: ${checks.length-failed}/${checks.length} PASS`);
if (failed) process.exit(1);
