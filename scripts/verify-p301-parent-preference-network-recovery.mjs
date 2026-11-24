import fs from 'node:fs';
import assert from 'node:assert/strict';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const pkg=JSON.parse(fs.readFileSync('apps/parent-mobile/package.json','utf8'));
const rootPkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const checks=[
['Expo Network dependency added',pkg.dependencies['expo-network']==='~6.0.2'],
['network state listener installed',app.includes('Network.addNetworkStateListener')],
['listener filters connected/reachable state',app.includes('state.isConnected&&state.isInternetReachable!==false')],
['network restoration triggers reconnect for offline session',app.includes('if(offlineSession){void reconnect();}')],
['online restored session triggers pending preference sync',app.includes('else{void syncPendingNotificationPreferences();}')],
['foreground refresh remains available',app.includes('AppState.addEventListener("change"')&&app.includes('void syncPendingNotificationPreferences();')],
['exponential backoff begins at 1.5s and caps at 60s',app.includes('notificationSyncBackoffMs=useRef(1500)')&&app.includes('Math.min(notificationSyncBackoffMs.current*2,60000)')],
['retry timestamp blocks repeated automatic sync',app.includes('Date.now()<notificationSyncRetryAt.current')],
['backoff resets after reconciled/successful sync',app.includes('notificationSyncBackoffMs.current=1500;notificationSyncRetryAt.current=0;')],
['network/app event listeners are cleaned up',app.includes('appSubscription.remove();networkSubscription.remove();')],
['verifier registered in root scripts',rootPkg.scripts['verify:p301']==='node scripts/verify-p301-parent-preference-network-recovery.mjs']
];
let passed=0;for(const [name,ok] of checks){if(ok){passed++;console.log(`PASS ${name}`)}else console.log(`FAIL ${name}`)}console.log(`${passed}/${checks.length} PASS`);assert.equal(passed,checks.length);
