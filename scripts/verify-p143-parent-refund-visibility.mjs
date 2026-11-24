import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const schema = read('backend/api/prisma/schema.prisma');
const migration = read('backend/api/prisma/migrations/20261118210000_p143_parent_refund_status_visibility/migration.sql');
const api = read('backend/api/src/modules/parents/parent.routes.ts');
const web = read('apps/school-admin/src/FinanceWorkspace.tsx');
const mobile = read('apps/parent-mobile/App.tsx');
const cache = read('apps/parent-mobile/src/offline/parent-cache.ts');
const checks = [
  ['Prisma publication timestamp field', /parentVisibleAt\s+DateTime\?/.test(schema)],
  ['Prisma publication actor field', /parentVisibleBy\s+String\?/.test(schema)],
  ['Migration adds persisted publication fields', /ADD COLUMN "parentVisibleAt"[\s\S]*ADD COLUMN "parentVisibleBy"/.test(migration)],
  ['Migration adds tenant/student visibility index', /CREATE INDEX[\s\S]*organizationId"?, "schoolId"?, "studentId"?, "parentVisibleAt/.test(migration)],
  ['School Admin refund list permission gate', /fees\.refunds\.approve/.test(api) && /fees\/refunds/.test(api)],
  ['Publish/hide API records event and audit', /parent-visibility/.test(api) && /PARENT_VISIBILITY_PUBLISHED/.test(api) && /PARENT_VISIBILITY_REVOKED/.test(api) && /student\.fee\.refund\.parent_published/.test(api)],
  ['Parent API requires consent/fee permission', /portal\/children\/:studentId\/refunds/.test(api) && /parentScope\(userId,organizationId,schoolId,'parent\.fees\.read'\)/.test(api)],
  ['Parent API enforces guardian link and publication filter', /parentStudentLink\(tx,userId,organizationId,schoolId,req\.params\.studentId\)/.test(api) && /parentVisibleAt:\{not:null\}/.test(api)],
  ['Parent response excludes internal event notes', /events:\{where:[\s\S]*select:\{id:true,eventType:true,fromStatus:true,toStatus:true,createdAt:true\}/.test(api)],
  ['School Admin UI loads and toggles publication', /call\('\/fees\/refunds'\)/.test(web) && /setRefundParentVisibility/.test(web) && /Publish status to parent/.test(web)],
  ['Parent Mobile fetches and displays refund timeline', /cachedRequest\("refunds"/.test(mobile) && /Refund requests & status/.test(mobile)],
  ['Parent Mobile uses secure offline cache and clears refund state', /writeParentCache/.test(cache) && /setRefundActivity\(\[\]\)/.test(mobile)],
];
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
assert.ok(checks.every(([, ok]) => ok), 'P143 static verification failed');
console.log(`P143 static verification: ${checks.filter(([, ok]) => ok).length}/${checks.length} PASS`);
