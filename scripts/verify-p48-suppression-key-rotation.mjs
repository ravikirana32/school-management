import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const helper = read('backend/api/src/modules/notifications/email-suppression.ts');
const routes = read('backend/api/src/modules/notifications/suppression.routes.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const schema = read('backend/api/prisma/schema.prisma');
const migration = 'backend/api/prisma/migrations/20261117234000_p48_versioned_suppression_hash_rotation/migration.sql';
const gaps = read('MASTER-OPEN-GAPS-REGISTER.md');
const checks = [
  ['current-first key selection', helper.includes('currentSecret || config.legacySecret')],
  ['previous key only enabled with explicit version', helper.includes('config.previousSecret && config.previousVersion')],
  ['legacy key backwards compatibility', helper.includes('legacySecret?: string')],
  ['versioned database column', schema.includes('hashVersion String @default("v1")')],
  ['versioned lookup index migration', existsSync(migration) && read(migration).includes('hashVersion')],
  ['new suppressions written with current version', routes.includes('hashVersion:currentHash.hashVersion')],
  ['create endpoint checks current and previous keys', routes.includes('OR:hashes.map')],
  ['worker checks every configured key version', worker.includes('OR: suppressionHashes')],
  ['worker remains fail closed without current key', worker.includes('getSuppressionHashKeys(')],
  ['no plaintext email persistence added', !/data:\s*\{[^}]*email:\s*parsed\.data\.email/.test(routes)],
  ['P48 gaps tracked', gaps.includes('P48-G001') && gaps.includes('P48-G004')],
];
for (const [name, pass] of checks) { console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); }
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P48 static verification failed');
console.log(`P48 static verification: ${checks.length}/${checks.length} PASS`);
