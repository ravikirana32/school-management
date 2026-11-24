import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const helper=fs.readFileSync('apps/parent-mobile/src/offline/notification-preference-intent.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('apps/parent-mobile/package.json','utf8'));
const checks=[
['secure storage is used',helper.includes('expo-secure-store')],
['storage key has versioned namespace',helper.includes('school.parent.notification-intent.v1')],
['scope binds user organization and school',helper.includes('accountScope(email)')&&helper.includes('organizationId')&&helper.includes('schoolId')],
['intent records include category channel and intended boolean',helper.includes('category: string; channel: string; enabled: boolean')],
['pending intent read supports expiry',helper.includes('TTL_MS')&&helper.includes('Date.now() - item.savedAt <= TTL_MS')],
['pending intent write replaces targeted key',helper.includes('existing.filter(item => !(item.category === category && item.channel === channel))')],
['pending intent clear is targeted',helper.includes('clearPendingPreferenceIntent')&&helper.includes('item.category === category && item.channel === channel')],
['parent mobile imports persistence helpers',app.includes('readPendingPreferenceIntents')&&app.includes('writePendingPreferenceIntent')&&app.includes('clearPendingPreferenceIntent')],
['pending intents hydrate when school or account changes',app.includes('readPendingPreferenceIntents(email,selected.organization.id,selected.school.id)')],
['failed save persists intent',app.includes('writePendingPreferenceIntent(email,selected.organization.id,selected.school.id,category,channel,enabled)')],
['successful save clears persisted intent',app.includes('clearPendingPreferenceIntent(email,selected.organization.id,selected.school.id,category,channel)')],
['reconciliation clears when server already matches',app.includes('if(current&&current.enabled===intended)')],
['package verifier script registered',pkg.scripts['verify:p298']==='node ../../scripts/verify-p298-parent-preference-intent-persistence.mjs']
];
let passed=0;for(const [name,ok] of checks){if(ok){passed++;console.log(`PASS ${name}`)}else console.log(`FAIL ${name}`)}
console.log(`${passed}/${checks.length} PASS`);if(passed!==checks.length)process.exit(1);
