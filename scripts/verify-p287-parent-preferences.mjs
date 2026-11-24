import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const checks=[
 ['Preference state',app.includes('notificationPreferences')],
 ['Preference load API',app.includes('portal/notification-preferences')],
 ['Preference update API',app.includes("method:'PUT'")&&app.includes('updateNotificationPreference')],
 ['Categories',app.includes("'GENERAL','REPORT_CARD','HOMEWORK','FEES','ATTENDANCE','ADMISSIONS'")],
 ['Channels',app.includes("['IN_APP','EMAIL','PUSH'")],
 ['Default enabled',app.includes('?.enabled!==false')],
 ['Offline disabled',app.includes('disabled={busy||offlineSession}')],
 ['Existing parent messaging preserved',app.includes('Messages to school')],
 ['Announcements preserved',app.includes('School announcements')]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
