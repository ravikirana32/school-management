import fs from 'node:fs';
const source=fs.readFileSync('apps/school-admin/src/CommunicationWorkspace.tsx','utf8');
const checks=[
 ['Preset template catalog exists',source.includes('communicationTemplatePresets:CommunicationTemplatePreset[]')],
 ['Admissions follow-up preset',source.includes('Admissions follow-up')],
 ['Document checklist preset',source.includes('Document checklist reminder')],
 ['Welcome academic-year preset',source.includes('Welcome to the academic year')],
 ['Template selection applies content',source.includes('function applyTemplate(id:string)')&&source.includes('setDraft(v=>({...v,title:preset.title,body:preset.body,audience:preset.audience')],
 ['Supported placeholder declared',source.includes('communicationTemplateVariables=["academicYear"]')],
 ['Academic year placeholder interpolation',source.includes('renderCommunicationTemplate(draft.title,templateVars)')&&source.includes('renderCommunicationTemplate(draft.body,templateVars)')],
 ['Unknown placeholders identified',source.includes('unknownTemplateVariables')&&source.includes('validateCommunicationTemplate')],
 ['Unknown placeholders block draft save',source.includes('unknownTemplateVariables.length>0')],
 ['Preview displays interpolated title/body',source.includes('Message preview')&&source.includes('{previewTitle}')&&source.includes('{previewBody}')],
 ['Academic year preview source',source.includes('currentYearLabel=years.find(y=>y.id===draft.targetAcademicYearId')],
 ['Existing audience selectors retained',source.includes('value="PARENTS"')&&source.includes('value="TEACHERS"')&&source.includes('value="STUDENTS"')],
 ['Existing school targeting selectors retained',source.includes('targetAcademicYearId')&&source.includes('targetGradeLevelId')&&source.includes('targetSectionName')],
 ['Existing publish workflow retained',source.includes('/communications/${encodeURIComponent(id)}/publish')],
 ['Preview clearly states recipient-specific values not substituted',source.includes('recipient-specific values are not substituted')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`${checks.length-failed}/${checks.length} passed`);if(failed)process.exit(1);
