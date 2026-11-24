import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const schema = fs.readFileSync(path.join(root,'backend/api/prisma/schema.prisma'),'utf8');
const routes = fs.readFileSync(path.join(root,'backend/api/src/modules/health/health.routes.ts'),'utf8');
const migration = fs.readFileSync(path.join(root,'backend/api/prisma/migrations/20261123165000_p541_health_safety_records/migration.sql'),'utf8');
const checks = [
 ['P541 allergy model',/model StudentHealthAllergy\s*\{/.test(schema)],
 ['P541 condition model',/model StudentHealthCondition\s*\{/.test(schema)],
 ['P541 medication model',/model StudentHealthMedication\s*\{/.test(schema)],
 ['Allergy severity validation',/severity: z\.enum\(\["UNKNOWN", "LOW", "MODERATE", "HIGH", "CRITICAL"\]\)/.test(routes)],
 ['Health read permission on collection endpoints',/safetyPermissions\(s, res, "read"\)/.test(routes)],
 ['Health manage permission on write endpoints',/safetyPermissions\(s, res, "manage"\)/.test(routes)],
 ['Tenant and school scoped lookups',/organizationId: s\.organizationId, schoolId: s\.schoolId, studentId: student\.id/.test(routes)],
 ['Collection GET routes registered in collection loop',routes.includes('healthRouter.get(`/:organizationId/:schoolId/health/students/:studentId/${collection}`')],
 ['Collection POST routes registered in collection loop',routes.includes('healthRouter.post(`/:organizationId/:schoolId/health/students/:studentId/${collection}`')],
 ['Collection PATCH routes registered in collection loop',routes.includes('healthRouter.patch(`/:organizationId/:schoolId/health/students/:studentId/${collection}/:recordId`')],
 ['Audit log fields are metadata only',/fieldsChanged: Object\.keys\(parsed\.data\)/.test(routes)],
 ['SQL migration includes all 3 tables',/CREATE TABLE `StudentHealthAllergy`/.test(migration)&&/CREATE TABLE `StudentHealthCondition`/.test(migration)&&/CREATE TABLE `StudentHealthMedication`/.test(migration)],
 ['SQL tenant composite FK constraints',/(Allergy|Condition|Medication)_student_scope_fk/.test(migration)&&migration.match(/student_scope_fk/g)?.length===3],
 ['Student relation additions',/healthAllergies StudentHealthAllergy\[\]/.test(schema)&&/healthConditions StudentHealthCondition\[\]/.test(schema)&&/healthMedications StudentHealthMedication\[\]/.test(schema)]
];
let failed=0;
for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`); if(!pass)failed++;}
console.log(`P541 focused checks: ${checks.length-failed}/${checks.length} PASS`);
process.exit(failed?1:0);
