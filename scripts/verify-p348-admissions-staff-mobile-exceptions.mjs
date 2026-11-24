import fs from 'node:fs';
const source=fs.readFileSync('apps/staff-mobile/src/AdmissionsPanel.tsx','utf8');
const checks=[
 ['Admissions exceptions endpoint is loaded',source.includes("request('/exceptions')")],
 ['Exception monitor state exists',source.includes('exceptionFeed,setExceptionFeed')],
 ['Summary metric rendering includes high/medium counts',source.includes("['High',exceptionFeed.summary.high]")&&source.includes("['Medium',exceptionFeed.summary.medium]" )],
 ['Summary renders SLA and offer/reservation/document signals', ['overdueSla','expiredOffers','expiredReservations','documentIssues'].every(x=>source.includes(x))],
 ['Exception rows render severity and type',source.includes('x.severity')&&source.includes("replaceAll('_',' ')" )],
 ['Exception signal displays application/offer reference',source.includes('x.applicationNumber||x.offerNumber||x.applicationId')],
 ['Refresh action is available',source.includes('Refresh exceptions')&&source.includes('onPress={load}')],
 ['Exception feed errors are surfaced separately',source.includes('exceptionError')&&source.includes('setExceptionError')],
 ['Exception rows are capped to 30 on mobile',source.includes('exceptions.slice(0,30)')],
];
let failed=0;for(const [name,pass] of checks){console.log(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)failed++;}
console.log(`${checks.length-failed}/${checks.length} checks passed`);process.exitCode=failed?1:0;
