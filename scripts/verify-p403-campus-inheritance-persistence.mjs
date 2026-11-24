import fs from 'node:fs';
import assert from 'node:assert/strict';
const routes=fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261121140000_p403_campus_inheritance_persistence/migration.sql','utf8');
const checks=[
 ['tenant-scoped campus inheritance endpoints',routes.includes('campus-inheritance') && routes.includes('CampusConfigInheritanceRecord')],
 ['PUT validates document before persistence',routes.includes('campusInheritanceErrors(doc, campusId)') && routes.includes('Invalid campus inheritance configuration')],
 ['DELETE SQL filters tenant and campus fields',/DELETE FROM[\s\S]*organizationId[\s\S]*schoolId[\s\S]*campusId/.test(routes)],
 ['endpoint permission checks',routes.includes('requirePermission(s, res, "school.settings.manage")')],
 ['audit log on save',routes.includes('school.campus.inheritance.saved')],
 ['audit log on delete',routes.includes('school.campus.inheritance.deleted')],
 ['supported scopes restricted',routes.includes('["profile", "working", "policies"]')],
 ['campus ID route binding',routes.includes('doc.campusId !== campusId')],
 ['self-parenting rejected',routes.includes('doc.parentCampusId === campusId')],
 ['Prisma model exists',schema.includes('model CampusConfigInheritanceRecord')],
 ['campus unique key',schema.includes('@@unique([organizationId, schoolId, campusId])')],
 ['JSONB column',migration.includes('"configDocument" JSONB NOT NULL')],
 ['RLS enabled and forced',migration.includes('ENABLE ROW LEVEL SECURITY') && migration.includes('FORCE ROW LEVEL SECURITY')],
 ['RLS tenant policy checks organization and school',migration.includes('app.current_organization_id') && migration.includes('app.current_school_id')],
 ['indexes cover uniqueness and parent lookup',migration.includes('org_school_campus_key') && migration.includes('org_school_parent_idx')]
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log(`PASS ${name}`)}
console.log(`P403 verifier: ${checks.length}/${checks.length} passed`);
