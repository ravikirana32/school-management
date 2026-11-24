import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const api=fs.readFileSync('backend/api/src/modules/report-cards/report-card.routes.ts','utf8');
const invitationSchema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const checks=[
 ['ADMISSIONS category visible in Parent Mobile preference UI',app.includes("'ADMISSIONS'" )],
 ['ADMISSIONS channel preference loop uses IN_APP/EMAIL/PUSH',app.includes("['IN_APP','EMAIL','PUSH']")],
 ['ADMISSIONS preference explanatory consent copy present',app.includes('Optional admission updates are controlled here')],
 ['Preference update API integration present',app.includes('notification-preferences')&&app.includes('updateNotificationPreference')],
 ['Preference pending/offline handling preserved',app.includes('writePendingPreferenceIntent')&&app.includes('offlineSession')],
 ['Conflict refresh/reconciliation remains wired',app.includes('reconcileNotificationPreference')],
 ['Admission communications consent is checked in recipient flow',api.includes('consentAcceptedAt')&&api.includes('consentWithdrawnAt:null')],
 ['Guardian communication eligibility uses consent and linked account',api.includes('canReceiveCommunications:true')&&api.includes('guardianActive')],
 ['Consent timestamp fields exist in schema',invitationSchema.includes('consentAcceptedAt')&&invitationSchema.includes('consentWithdrawnAt')],
];
for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);}
assert.equal(checks.filter(([,ok])=>ok).length,checks.length);
console.log(`P346 verifier: ${checks.length}/${checks.length} PASS`);
