import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const route = read('backend/api/src/modules/notifications/suppression.routes.ts');
const helper = read('backend/api/src/modules/notifications/notification-pagination.ts');
const tests = read('backend/api/src/modules/notifications/notification-pagination.test.ts');
const schema = read('backend/api/prisma/schema.prisma');
const migration = 'backend/api/prisma/migrations/20261117235000_p57_suppression_keyset_index/migration.sql';
const ui = read('apps/school-admin/src/NotificationSuppressionWorkspace.tsx');
const checks = [
 ['page limit defaults/clamps to 1..100', helper.includes('Math.max(1, Math.min(100, rawLimit))')],
 ['cursor is bounded and validated', helper.includes('query.cursor.length > 128') && helper.includes('invalidCursor: true')],
 ['API verifies cursor belongs to tenant/school', route.includes('id:cursor,organizationId:s.organizationId,schoolId:s.schoolId')],
 ['API uses stable createdAt/id ordering', route.includes('orderBy:[{createdAt:"desc"},{id:"desc"}]')],
 ['API uses keyset cursor with skip one', route.includes('cursor:{id:cursor},skip:1')],
 ['API bounds page size and audit events', route.includes('take:limit+1') && route.includes('take:Math.min(limit*3,300)')],
 ['Prisma schema includes pagination index', schema.includes('status, createdAt(sort: Desc), id(sort: Desc)')],
 ['migration creates matching pagination index', existsSync(migration) && read(migration).includes('"status", "createdAt" DESC, "id" DESC')],
 ['pagination helper tests cover invalid cursors and limits', tests.includes('rejects empty, oversized and non-string cursors')],
 ['School Admin UI exposes load-more pagination', ui.includes('Load more') && ui.includes('setHasMore(Boolean(payload.pagination?.hasMore))')],
 ['UI appends pages rather than replacing prior rows', ui.includes('append ? [...current, ...pageRows] : pageRows')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P57 static verification failed');
console.log(`P57 static verification: ${checks.length}/${checks.length} PASS`);
