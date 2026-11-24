import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const helper=fs.readFileSync('apps/parent-mobile/src/offline/notification-preference-intent.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('apps/parent-mobile/package.json','utf8'));
const checks=[
['foreground lifecycle triggers pending-intent sync',app.includes('void syncPendingNotificationPreferences()')&&app.includes('state==="active"')],
['sync is gated by selected school and online state',app.includes('if(!selected||offlineSession||pendingPreferenceSyncLock.current||Date.now()<notificationSyncRetryAt.current)return')],
['single sync lock prevents concurrent sync runs',app.includes('pendingPreferenceSyncLock.current=true')&&app.includes('pendingPreferenceSyncLock.current=false')],
['pending intents are read from scoped secure storage',app.includes('readPendingPreferenceIntents(email,selected.organization.id,selected.school.id)')],
['sync applies intent category/channel/value only',app.includes('category:intent.category,channel:intent.channel,enabled:intent.enabled')],
['sync iterates pending intents in order',app.includes('for(const intent of intents)')],
['per-item save lock skips duplicates',app.includes('if(savingNotificationPreference[key]||reconcilingNotificationPreference[key])continue')],
['server confirmed success updates UI state',app.includes('Pending preference synced after reconnect.')&&app.includes('enabled:intent.enabled')],
['success clears secure pending record',app.includes('await clearPendingPreferenceIntent(email,selected.organization.id,selected.school.id,intent.category,intent.channel)')],
['success clears pending/retry state',app.includes('delete next[key];return next;')],
['failure preserves pending intent and continues other queue items',app.includes('Sync failed. Pending intent retained. Retry is delayed to prevent repeated requests.')&&app.includes('notificationSyncBackoffMs.current=Math.min(notificationSyncBackoffMs.current*2,60000);continue;')],
['sync lock always released',app.includes('finally{pendingPreferenceSyncLock.current=false;}')],
['package verifier registered',pkg.scripts['verify:p299']==='node ../../scripts/verify-p299-parent-preference-reconnect-sync.mjs']
];let passed=0;for(const [name,ok] of checks){if(ok){passed++;console.log(`PASS ${name}`)}else console.log(`FAIL ${name}`)}console.log(`${passed}/${checks.length} PASS`);if(passed!==checks.length)process.exit(1);
