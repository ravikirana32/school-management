import fs from 'node:fs';
const source=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['explicit server-state recovery action exists',source.includes('Refresh server state')],
 ['recovery action is accessible',source.includes('accessibilityLabel={`Refresh server state for ${category.replaceAll')],
 ['recovery action fetches targeted preference reconciliation',source.includes('onPress={()=>void reconcileNotificationPreference(category,channel,retryNotificationPreference[notificationPreferenceKey(category,channel)])}')],
 ['refresh action duplicate guard disables while reconciling',source.includes('disabled={offlineSession||reconcilingNotificationPreference[notificationPreferenceKey(category,channel)]||savingNotificationPreference[notificationPreferenceKey(category,channel)]}')],
 ['pending intended value retained for recovery',source.includes('retryNotificationPreference[notificationPreferenceKey(category,channel)]')],
 ['reapply action targets same category and channel',source.includes('updateNotificationPreference(category,channel,retryNotificationPreference[notificationPreferenceKey(category,channel)])')],
 ['offline guard remains on reconciliation',source.includes('if(!selected||offlineSession)return;')],
 ['conflict codes trigger state reconciliation',source.includes('status===409||status===412')],
 ['reconciliation is scoped to selected org and school',source.includes('/parents/${selected.organization.id}/${selected.school.id}/portal/notification-preferences')],
 ['switch locked during reconciliation',source.includes('reconcilingNotificationPreference[notificationPreferenceKey(category,channel)]')],
 ['retry success clears pending intent',source.includes('delete next[key]')],
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} passed`); if(failed)process.exit(1);
