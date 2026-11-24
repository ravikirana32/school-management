const fs=require('node:fs');const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const api=fs.readFileSync('backend/api/src/modules/admissions/admission.routes.ts','utf8');
const mobile=fs.readFileSync('apps/staff-mobile/src/AdmissionsPanel.tsx','utf8');
const checks=[
 ['Preflight endpoint exists',api.includes('/applications/:applicationId/guardian-matches')],
 ['Preflight admissions.manage authorization',api.includes('scope(req,res,"admissions.manage")')],
 ['Tenant/school scoped application lookup',api.includes('organizationId:s.organizationId,schoolId:s.schoolId,status:"ACCEPTED"')],
 ['Guardian contact normalization matching',api.includes('hasGuardianContactMatch({email:a.guardianEmail,phone:a.guardianPhone}')],
 ['Match reasons exposed for staff review',api.includes('matchEmail:Boolean')&&api.includes('matchPhone:Boolean')],
 ['Duplicate applicant match check present',api.includes('possibleDuplicateApplications')&&api.includes('normalizeChild')],
 ['Conversion validates selected guardian against matching candidates',api.includes('guardian=guardianMatches.find(g=>g.id===p.data.guardianId)')&&api.includes('GUARDIAN_SELECTION_INVALID')],
 ['Staff mobile identity review & selection UI',mobile.includes('Check guardian identity matches')&&mobile.includes('guardianSelectionByApp')&&mobile.includes('possibleDuplicateApplications')]
];for(const [label,ok] of checks)console.log(`${ok?'PASS':'FAIL'} ${label}`);
for(const f of ['apps/staff-mobile/src/AdmissionsPanel.tsx','backend/api/src/modules/admissions/admission.routes.ts']){const src=fs.readFileSync(f,'utf8');const out=ts.transpileModule(src,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext},reportDiagnostics:true});const ds=out.diagnostics||[];checks.push([`Transpile ${f}`,ds.length===0]);console.log(`${ds.length===0?'PASS':'FAIL'} Transpile ${f} (${ds.length} diagnostics)`);}
if(checks.some(x=>!x[1]))process.exit(1);console.log(`P333 verification ${checks.length}/${checks.length} PASS`);
