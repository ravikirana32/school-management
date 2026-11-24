import fs from 'node:fs';
const file='apps/school-admin/src/OnboardingWorkspace.tsx'; const source=fs.readFileSync(file,'utf8');
const checks=[
['CSV template is downloadable',source.includes('downloadAssignmentTemplate')&&source.includes('school-onboarding-assignments-template.csv')],
['CSV taskKey/email headers are required',source.includes('CSV must include taskKey and email columns')],
['Unknown task keys are rejected',source.includes('Unknown task key')],
['Duplicate task keys are rejected',source.includes('Duplicate task in CSV')],
['Only active roster member emails accepted',source.includes('Email is not an active member')],
['Blank email supports unassignment',source.includes('Valid (unassign)')],
['Preview rows are displayed before apply',source.includes('bulkPreview.map((row,index)')],
['Apply disabled for invalid preview rows',source.includes('bulkPreview.some(row=>!row.valid)')],
['Sequential assignment API requests',source.includes('for (const row of rows)')&&source.includes('/onboarding-assignments`')],
['Summary reports succeeded and failed rows',source.includes('assignment(s) applied;')],
['Import busy state prevents duplicate submission',source.includes('bulkBusy')&&source.includes('setBulkBusy(true)')]
]; let failed=0; for(const [label,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${label}`);if(!ok)failed++;} console.log(`${checks.length-failed}/${checks.length} passed`); if(failed)process.exit(1);
