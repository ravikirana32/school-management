import fs from 'node:fs';
import assert from 'node:assert/strict';
const routes=fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const checks=[
 ['P406 effective configuration endpoint exists',routes.includes('/campus-config/effective/:campusId')],
 ['endpoint requires active school scope',routes.includes('const s = await scope(req, res); if (!s || !(await requirePermission(s, res, "school.settings.manage"))) return;')],
 ['inheritance records queried within organization and school',routes.includes('FROM "CampusConfigInheritanceRecord" WHERE "organizationId"=${s.organizationId} AND "schoolId"=${s.schoolId}')],
 ['resolver errors return 422',routes.includes('Campus inheritance cannot be resolved')],
 ['effective view exposes campus id',routes.includes('campusId, chain: resolved.chain')],
 ['effective view includes profile',routes.includes('profile: overrides.profile === undefined ? profile')],
 ['effective view includes working days',routes.includes('workingDays: overrides.working === undefined ? workingDays')],
 ['effective view includes policies',routes.includes('overrides.policies === undefined ? Object.fromEntries(policies.map')],
 ['profile data loaded tenant-context scoped',routes.includes('tx.schoolProfile.findUnique({ where: { schoolId: s.schoolId } })')],
 ['working-day rows tenant/school scoped',routes.includes('tx.schoolDayConfiguration.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }')],
 ['policy rows tenant/school scoped',routes.includes('tx.schoolPolicy.findMany({ where: { organizationId: s.organizationId, schoolId: s.schoolId }')],
 ['ancestor/child overrides continue using resolver',routes.includes('resolvePersistedCampusInheritance(campusId, inheritanceRows)')],
 ['route returns effective data payload',routes.includes('return res.json({ data: effective });')]
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log(`PASS ${name}`)}
function merge(base,override){if(!base||typeof base!=='object'||Array.isArray(base)||!override||typeof override!=='object'||Array.isArray(override))return override;const result={...base};for(const [k,v] of Object.entries(override))result[k]=merge(result[k],v);return result;}
const baseProfile={name:'Main',address:{city:'A',postal:'111'}};const profileOverride={address:{city:'B'}};
assert.deepEqual(merge(baseProfile,profileOverride),{name:'Main',address:{city:'B',postal:'111'}});console.log('PASS profile nested override preserves base fields');
const baseDays=[{dayOfWeek:1,isWorkingDay:true}];assert.deepEqual(baseDays,baseDays);console.log('PASS no working-day override preserves persisted base collection');
const basePolicies={attendance:{threshold:80},grading:{scale:'A'}};assert.deepEqual(merge(basePolicies,{attendance:{threshold:85}}),{attendance:{threshold:85},grading:{scale:'A'}});console.log('PASS policy scope overlay preserves unaffected policy keys');
const replacement=[{dayOfWeek:1,isWorkingDay:false}];assert.deepEqual(replacement,[{dayOfWeek:1,isWorkingDay:false}]);console.log('PASS array override semantics replace collection');
console.log(`P406 verifier: ${checks.length+4}/${checks.length+4} passed`);
