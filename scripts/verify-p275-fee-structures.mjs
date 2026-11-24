import fs from 'node:fs';
import assert from 'node:assert/strict';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/FeeStructuresWorkspace.tsx','utf8');
const main=fs.readFileSync('apps/school-admin/src/main.tsx','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261119233000_p275_fee_structures/migration.sql','utf8');
for(const [name,source,pattern] of [
 ['Prisma model',schema,/model FeeStructure \{/],['Tenant-scoped list route',routes,/fee-structures.*findMany/],['Create route',routes,/fee-structures.*feeStructure\.create/],['Draft-only edit',routes,/Only draft fee structures can be edited/],['Publish lifecycle',routes,/fee-structures.*publishedAt/],['Archive lifecycle',routes,/fee-structures.*archivedAt/],['Component validation',routes,/feeStructureComponentSchema/],['School admin UI',ui,/Create fee structure \(draft\)/],['UI wired to admin',main,/FeeStructuresWorkspace/],['Migration table',migration,/CREATE TABLE "FeeStructure"/],['School code uniqueness',migration,/FeeStructure_schoolId_code_key/],['Tenant RLS policy',migration,/FeeStructure_tenant_policy/]
]) { assert.match(source,pattern,`${name} assertion failed`); }
assert.match(ui,/components\.map/);assert.match(ui,/mandatory/);assert.match(ui,/ONE_TIME/);assert.match(ui,/ANNUAL/);assert.match(ui,/TERM/);assert.match(ui,/MONTHLY/);
console.log('P275 static source assertions: 12/12 passed');
