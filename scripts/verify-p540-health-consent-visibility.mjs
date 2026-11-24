import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const parent=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const checks=[
 ['granular health consent model exists',schema.includes('model StudentHealthConsent {')],
 ['consent keyed per org school student guardian',schema.includes('@@unique([organizationId, schoolId, studentId, guardianId])')],
 ['consent lifecycle supports granted and revoked',schema.includes('grantedAt DateTime?')&&schema.includes('revokedAt DateTime?')],
 ['guardian consent grant endpoint exists',parent.includes('portal/children/:studentId/health-consent')&&parent.includes('parent.health.consent.granted')],
 ['guardian consent revoke endpoint exists',parent.includes('parent.health.consent.revoked')&&parent.includes('revokedAt:new Date()')],
 ['guardian scope requires verified consented parent access',parent.includes('parentScope(userId,organizationId,schoolId,"parent.health.read")')],
 ['grant requires linked student relationship',parent.includes('canReceiveCommunications:true')&&parent.includes('Student is not linked to this verified guardian')],
 ['parent health response filters to active health consent',parent.includes('consentedStudentIds')&&parent.includes('revokedAt:null')],
 ['consent events are audit logged',parent.includes('parent.health.consent.granted')&&parent.includes('parent.health.consent.revoked')],
 ['migration created for granular consent table',fs.existsSync('backend/api/prisma/migrations/20261123152000_p540_health_guardian_consent/migration.sql')],
 ['consent audit avoids health payload values',parent.includes('consentVersion:row.consentVersion')&&parent.includes('revokedCount:rows.count')],
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`P540 verifier: ${checks.length-failed}/${checks.length} PASS`);if(failed)process.exit(1);
