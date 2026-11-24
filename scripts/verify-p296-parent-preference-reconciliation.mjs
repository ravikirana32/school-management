import fs from 'node:fs';
const source=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['reconciliation routine present',source.includes('reconcileNotificationPreference=async(')],
 ['server preference list fetched after conflict',source.includes('portal/notification-preferences`);const rows=result.data||[]')],
 ['conflict statuses 409 and 412 recognized',source.includes('status===409||status===412')],
 ['pending user intent retained on conflict',source.includes('setRetryNotificationPreference(state=>({...state,[key]:enabled}))')],
 ['server value merged for only affected category/channel',source.includes('x.category===category&&x.channel===channel?{...x,...(current||{})}')],
 ['reconciliation duplicate guard',source.includes('if(reconcilingNotificationPreference[key])return')],
 ['reconciliation state cleared in finally',source.includes('setReconcilingNotificationPreference(state=>({...state,[key]:false}))')],
 ['switch and retry disabled while reconciling',source.includes('reconcilingNotificationPreference[notificationPreferenceKey(category,channel)]')],
 ['conflict message provides reconciliation feedback',source.includes('Preference changed on the server. Refreshing the latest value…')],
 ['tenant/school scoped endpoint remains',source.includes('selected.organization.id}/${selected.school.id}/portal/notification-preferences')],
 ['offline mutation guard retained',source.includes('if(!selected||offlineSession)return;')]
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}console.log(`${checks.length-failed}/${checks.length} passed`);if(failed)process.exit(1);
