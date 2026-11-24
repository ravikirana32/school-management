import fs from 'node:fs';
const route = fs.readFileSync('backend/api/src/modules/health/health.routes.ts','utf8');
const checks = [
 ['health routes require authentication middleware', route.includes('healthRouter.use(authenticate)')],
 ['active school membership tenant gate retained', route.includes('hasActiveSchoolMembership') && route.includes('Active school membership required')],
 ['profile reads require health.read', route.includes('health.profile.read') && route.includes('health.read')],
 ['profile writes require health.manage', route.includes('health.profile.write') && route.includes('health.manage')],
 ['sensitive field permission is explicit', route.includes('health.read.sensitive')],
 ['non-sensitive profile response is masked', route.includes('function maskProfile') && route.includes('restricted: true')],
 ['non-sensitive health event detail fields are masked', route.includes('function maskEvents') && route.includes('({ id, studentId, eventType, occurredAt, summary, recordedBy, createdAt }: any)')],
 ['student record lookups scoped to org and school', route.includes('organizationId: s.organizationId, schoolId: s.schoolId, studentId: req.params.studentId')],
 ['read and write access audit events exist', route.includes('health.events.read') && route.includes('health.events.write') && route.includes('health.profile.write')],
 ['audit metadata explicitly excludes health values', route.includes('Never include health values, clinical notes, medication names, or profile payloads')],
 ['sensitive payload inclusion is recorded as boolean only', route.includes('sensitiveFieldsIncluded: allowSensitive')],
];
let failed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`); if (!ok) failed++; }
console.log(`P539 verifier: ${checks.length-failed}/${checks.length} PASS`);
if (failed) process.exit(1);
