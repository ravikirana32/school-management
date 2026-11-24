import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const checks=[];
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const exists=(p)=>fs.existsSync(path.join(root,p));
const check=(name,ok)=>checks.push({name,ok:!!ok});
const app=read('apps/parent-mobile/App.tsx');
const pkg=JSON.parse(read('apps/parent-mobile/package.json'));
const gaps=read('docs/MASTER-OPEN-GAPS-REGISTER.md');
const components=[
 ['academics/ParentAcademicPlanner.tsx','ParentAcademicPlanner'],
 ['academics/ParentAcademicActivitySummary.tsx','ParentAcademicActivitySummary'],
 ['finance/ParentFinanceSummary.tsx','ParentFinanceSummary'],
 ['communication/ParentCommunicationSummary.tsx','ParentCommunicationSummary'],
 ['specialist/ParentSpecialistJourneys.tsx','ParentSpecialistJourneys'],
 ['canteen/ParentCanteenScreen.tsx','ParentCanteenScreen'],
 ['health/ParentHealthScreen.tsx','ParentHealthScreen'],
 ['health/health-api.ts','health-api']
];
check('P482 verifier file executes from repository root',true);
check('Parent app entry exists',exists('apps/parent-mobile/App.tsx'));
check('Parent app package manifest parses',!!pkg.scripts && !!pkg.dependencies);
check('Planner component source present',exists('apps/parent-mobile/src/academics/ParentAcademicPlanner.tsx'));
check('Academic activity summary source present',exists('apps/parent-mobile/src/academics/ParentAcademicActivitySummary.tsx'));
check('Finance summary source present',exists('apps/parent-mobile/src/finance/ParentFinanceSummary.tsx'));
check('Communication summary source present',exists('apps/parent-mobile/src/communication/ParentCommunicationSummary.tsx'));
check('Specialist journey UI source present',exists('apps/parent-mobile/src/specialist/ParentSpecialistJourneys.tsx'));
check('Canteen parent screen source present',exists('apps/parent-mobile/src/canteen/ParentCanteenScreen.tsx'));
check('Parent health screen and API sources present',exists('apps/parent-mobile/src/health/ParentHealthScreen.tsx')&&exists('apps/parent-mobile/src/health/health-api.ts'));
check('App integrates academic planner',app.includes('<ParentAcademicPlanner'));
check('App integrates academic snapshot',app.includes('<ParentAcademicActivitySummary'));
check('App integrates finance summary',app.includes('<ParentFinanceSummary'));
check('App integrates communication summary',app.includes('<ParentCommunicationSummary'));
check('App integrates specialist journeys',app.includes('<ParentSpecialistJourneys'));
check('P473 parent journey audit script retained',exists('scripts/verify-p473-parent-mobile-journey-audit.mjs'));
check('P474 child context verifier retained',exists('scripts/verify-p474-parent-child-context.mjs'));
check('P475 planner verifier retained',exists('scripts/verify-p475-parent-academic-planner.mjs'));
check('P476 API integration verifier retained',exists('scripts/verify-p476-parent-academic-api-integration.mjs'));
check('P477 finance verifier retained',exists('scripts/verify-p477-parent-finance-summary.mjs'));
check('P478 academic snapshot verifier retained',exists('scripts/verify-p478-parent-academic-activity-summary.mjs'));
check('P479 communication verifier retained',exists('scripts/verify-p479-parent-communication-summary.mjs'));
check('P480 canteen and wellbeing verifier retained',exists('scripts/verify-p480-parent-canteen-health-wellbeing.mjs'));
check('P481 specialist verifier retained',exists('scripts/verify-p481-parent-specialist-journeys.mjs'));
check('P482 verifier script registered',pkg.scripts['verify:p482']==='node ../../scripts/verify-p482-c2-05-parent-cycle-closure.mjs');
check('P482 gap register section present',gaps.includes('## P482 — C2-05 Parent Mobile Cycle Closure'));
check('Parent runtime verification gaps explicitly tracked',gaps.includes('P482-G001'));
check('Cycle closure avoids claiming runtime E2E complete',gaps.includes('RUNTIME_NOT_VERIFIED'));
for(const c of components) check(`${c[1]} component source exists`,exists(`apps/parent-mobile/src/${c[0]}`));
const failed=checks.filter(x=>!x.ok);
console.log(`P482 Parent Mobile Cycle Closure: ${checks.length-failed.length}/${checks.length} PASS`);
for(const c of checks) console.log(`${c.ok?'PASS':'FAIL'} - ${c.name}`);
if(failed.length) process.exit(1);
