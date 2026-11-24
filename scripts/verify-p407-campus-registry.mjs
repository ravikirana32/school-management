import fs from 'node:fs';
import assert from 'node:assert/strict';
const route=fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const migration=fs.readFileSync('backend/api/prisma/migrations/20261121150000_p407_campus_registry/migration.sql','utf8');
const checks=[
 ['campus registry list endpoint exists',route.includes('/:schoolId/campus-registry') && route.includes('campus-registry", asyncRoute')],
 ['campus registry creation endpoint exists',route.includes('schoolConfigRouter.post("/:organizationId/:schoolId/campus-registry"')],
 ['campus registry update endpoint exists',route.includes('schoolConfigRouter.put("/:organizationId/:schoolId/campus-registry/:campusId"')],
 ['campus archive endpoint exists',route.includes('schoolConfigRouter.delete("/:organizationId/:schoolId/campus-registry/:campusId"')],
 ['routes enforce school settings permission',route.includes('campus-registry') && route.includes('requirePermission(s, res, "school.settings.manage")')],
 ['campus fields are validated and length limited',route.includes('campusCode.length > 40') && route.includes('name.length > 160') && route.includes('description.length > 500')],
 ['status limited to active/inactive on request',route.includes('["ACTIVE", "INACTIVE"].includes(status)')],
 ['campus creation uses tenant-context transaction',route.includes('INSERT INTO "SchoolCampus"') && route.includes('withTenantContext(prisma, s, async tx =>')],
 ['campus updates tenant/school scoped',route.includes('AND "schoolId"=${s.schoolId} AND "id"=${campusId}')],
 ['archiving is soft and status based',route.includes('SET "status"=\'ARCHIVED\',"isMain"=FALSE')],
 ['campus creation/update/archive audit events',route.includes('school.campus.created') && route.includes('school.campus.updated') && route.includes('school.campus.archived')],
 ['inheritance PUT requires campus registry',route.includes('Campus registry record is required before inheritance can be saved')],
 ['inheritance parent must be active registered campus',route.includes('Parent campus must exist in the active campus registry')],
 ['effective campus configuration checks registry existence',route.includes('Active campus registry record not found')],
 ['registry table tenant-scoped',migration.includes('"organizationId" TEXT NOT NULL') && migration.includes('"schoolId" TEXT NOT NULL')],
 ['registry code unique per tenant/school case-insensitive',migration.includes('upper("campusCode")')],
 ['single active main campus constraint',migration.includes('WHERE "isMain" = TRUE AND "status" = \'ACTIVE\'')],
 ['status and required fields constrained at DB',migration.includes('SchoolCampus_status_check') && migration.includes('SchoolCampus_name_nonempty_check')],
 ['RLS enabled and forced',migration.includes('ENABLE ROW LEVEL SECURITY') && migration.includes('FORCE ROW LEVEL SECURITY')],
 ['RLS policy restricts org and school',migration.includes('current_setting(\'app.current_organization_id\', true)') && migration.includes('current_setting(\'app.current_school_id\', true)')]
];
for(const [label,pass] of checks){assert.ok(pass,label);console.log(`PASS ${label}`)}
console.log(`P407 verifier: ${checks.length}/${checks.length} passed`);
