import fs from 'node:fs';
const app=fs.readFileSync(new URL('../apps/parent-mobile/App.tsx',import.meta.url),'utf8');
const checks=[
 ['multi-child daily overview rendered',app.includes('Daily overview ·')&&app.includes('children.map(child=>')],
 ['child context selector wired',app.includes('selectChildContext(child)')],
 ['child-context composite scope',app.includes('`${selected?.organization.id}:${selected?.school.id}:${child.id}`')],
 ['stale attendance responses discarded',app.includes('activeChildContext.current!==`${selected?.organization.id}:${selected?.school.id}:${child.id}`')],
 ['stale detail responses discarded',app.includes('if(activeChildContext.current!==`${selected?.organization.id}:${selected?.school.id}:${child.id}`)')],
 ['attendance reset on context switch',app.includes('const clearChildContext=()=>{setAttendance([]);')],
 ['fees cleared on context switch',app.includes('setFees([]);setRefundActivity([]);')],
 ['homework and report cards cleared on context switch',app.includes('setHomework([]);setReportCards([]);')],
 ['notifications cleared on context switch',app.includes('setNotifications([]);setNotificationCursor(null);')],
 ['active child selected before fetch',app.includes('activeChildContext.current=`${selected?.organization.id}:${selected?.school.id}:${child.id}`;setActiveChild(child);clearChildContext();')],
 ['daily overview shows enrollment and status',app.includes('No current enrollment')&&app.includes('child.status.replaceAll("_"," ")')],
 ['linked students list still present',app.includes('Linked students ·')],
];
let failed=0;for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;}
console.log(`P474 verifier: ${checks.length-failed}/${checks.length} checks passed`);if(failed)process.exit(1);
