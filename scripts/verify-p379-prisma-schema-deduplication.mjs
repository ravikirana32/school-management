import fs from 'node:fs';
const schema = fs.readFileSync('backend/api/prisma/schema.prisma', 'utf8');
const declarations = [...schema.matchAll(/^(?:model|enum)\s+(\w+)/gm)].map(match => match[1]);
const counts = new Map();
for (const key of declarations) counts.set(key, (counts.get(key) || 0) + 1);
const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
const checks = [
  ['single Prisma generator block', (schema.match(/^generator client \{/gm) || []).length === 1],
  ['single Prisma datasource block', (schema.match(/^datasource db \{/gm) || []).length === 1],
  ['no duplicate model or enum declarations', duplicates.length === 0],
  ['P377 onboarding progress model retained', schema.includes('model SchoolOnboardingProgress')],
  ['P378 onboarding task assignment model retained', schema.includes('model SchoolOnboardingTaskAssignment')],
  ['schema closes with model blocks rather than duplicate generator config', schema.trimEnd().endsWith('}') && !schema.trimEnd().endsWith('// after the P02/P04 identity and tenancy design is finalized.')],
];
let failures = 0;
for (const [label, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`); if (!pass) failures++; }
if (duplicates.length) console.log('Duplicate declarations:', duplicates.map(([key, count]) => `${key}×${count}`).join(', '));
console.log(`${checks.length - failures}/${checks.length} checks passed`);
if (failures) process.exit(1);
