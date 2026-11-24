import fs from 'node:fs';
const source=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['notification preference saving state exists',source.includes('savingNotificationPreference')],
 ['per-channel save feedback state exists',source.includes('notificationPreferenceFeedback')],
 ['duplicate saves are guarded',source.includes('if(savingNotificationPreference[key]||reconcilingNotificationPreference[key])return')],
 ['saving feedback is shown',source.includes('Saving notification preference…')],
 ['successful save feedback is shown',source.includes('Preference saved.')],
 ['failed save feedback is retained and surfaced',source.includes("status:'error',message")&&source.includes('setError(message)')],
 ['switch is disabled during save',source.includes('savingNotificationPreference[notificationPreferenceKey(category,channel)]')],
 ['preference update uses PUT endpoint',source.includes('portal/notification-preferences')&&source.includes("method:'PUT'")],
 ['feedback accessibility role is present',source.includes("status==='error'?'alert':'text'")],
 ['offline mutation guard preserved',source.includes('if(!selected||offlineSession)return;')]
];
let failed=0; for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} passed`); if(failed)process.exit(1);
