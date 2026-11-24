import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const pairs = [
  ['MASTER-ACTIVE-GAPS-REGISTER.md', 'docs/MASTER-ACTIVE-GAPS-REGISTER.md'],
  ['MASTER-ACTIVE-GAPS-REGISTER.md', 'docs/phases/MASTER-ACTIVE-GAPS-REGISTER.md'],
  ['MASTER-OPEN-GAPS-REGISTER.md', 'docs/MASTER-OPEN-GAPS-REGISTER.md'],
  ['MASTER-OPEN-GAPS-REGISTER.md', 'docs/phases/MASTER-OPEN-GAPS-REGISTER.md'],
  ['FINAL-DETAILS-ALL-FEATURES.md', 'docs/FINAL-DETAILS-ALL-FEATURES.md'],
  ['CHANGELOG.md', 'docs/CHANGELOG.md'],
];
let passed = 0;
for (const [source, mirror] of pairs) {
  const a = readFileSync(resolve(root, source));
  const b = readFileSync(resolve(root, mirror));
  if (a.equals(b)) {
    passed++;
    console.log(`PASS mirror parity: ${source} == ${mirror}`);
  } else {
    console.error(`FAIL mirror parity: ${source} != ${mirror}`);
  }
}
console.log(`C2-01 documentation/register mirror gate: ${passed}/${pairs.length} PASS`);
if (passed !== pairs.length) process.exit(1);
