import fs from 'node:fs';
const route=fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/OnboardingWorkspace.tsx','utf8');
const checks=[
['profile check has empty dependency list',route.includes('key: "profile"')&&route.includes('prerequisites: []')],
['academic year depends on profile',route.includes('key: "academic-year"')&&route.includes('prerequisites: ["profile"]')],
['terms depend on academic year',route.includes('key: "terms"')&&route.includes('prerequisites: ["academic-year"]')],
['calendar has profile and academic year dependencies',route.includes('key: "calendar"')&&route.includes('prerequisites: ["profile", "academic-year"]')],
['working days depend on profile',route.includes('key: "working-days"')&&route.includes('prerequisites: ["profile"]')],
['attendance and grading policies depend on profile and academic year',route.includes('key: "attendance-policy"')&&route.includes('key: "grading-policy"')&&route.includes('prerequisites: ["profile", "academic-year"]')],
['readiness API returns recommended next actionable key and workflow summary',route.includes('nextIncompleteKey = orchestratedChecks.find(check => check.actionable)?.key ?? orchestratedChecks.find(check => !check.complete)?.key ?? null')&&route.includes('blockedCount, actionableCount, allComplete')&&route.includes('workflowStatus: allComplete ?')],
['UI consumes server dependency metadata with fallback',ui.includes('Array.isArray(details(key).prerequisites)')&&ui.includes('prerequisites("calendar", ["profile", "academic-year"])')],
['UI consumes server recommended next incomplete key',ui.includes('setServerNextIncompleteKey(typeof readiness?.nextIncompleteKey')&&ui.includes('serverNextIncompleteKey ??')],
['configure buttons remain dependency-gated',ui.includes('disabled={configureBlocked}')&&ui.includes('item.prerequisites.some(key => !items.find(candidate => candidate.key === key)?.complete)')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}console.log(`${checks.length-failed}/${checks.length} checks passed`);if(failed)process.exit(1);
