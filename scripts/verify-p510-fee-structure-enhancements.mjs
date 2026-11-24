import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js';
const uiPath='apps/school-admin/src/FeeStructuresWorkspace.tsx';
const apiPath='backend/api/src/modules/parents/parent.routes.ts';
const ui=fs.readFileSync(uiPath,'utf8');
const api=fs.readFileSync(apiPath,'utf8');
const rootPackage=JSON.parse(fs.readFileSync('package.json','utf8'));
const parse=(file,kind)=>ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,kind).parseDiagnostics;
const uiDiagnostics=parse(uiPath,ts.ScriptKind.TSX); const apiDiagnostics=parse(apiPath,ts.ScriptKind.TS);
const tests=[
 ['Fee component carries configurable category code',()=>assert.match(ui,/categoryCode:\s*string/)],
 ['New fee component defaults to tuition category',()=>assert.match(ui,/categoryCode:\s*"TUITION"/)],
 ['Finance configuration endpoint is fetched by UI',()=>assert.match(ui,/api\/v1\/finance\/.*\/configuration/)],
 ['UI reads school-configured currency',()=>assert.match(ui,/config\.currency\s*\|\|\s*f\.currency/)],
 ['UI exposes active configured fee categories',()=>assert.match(ui,/\.filter\(\(x:any\)\s*=>\s*x\.active\)/)],
 ['UI component category is selectable',()=>assert.match(ui,/<label>Fee category<select/)],
 ['UI displays category labels in component list',()=>assert.match(ui,/categoryCode\s*\?\s*` ·/)],
 ['UI blocks structure save when no active category exists',()=>assert.match(ui,/!activeCategories\.length/)],
 ['Legacy components remain identifiable without category',()=>assert.match(ui,/Legacy uncategorized/)],
 ['Draft edit remaps legacy or inactive categories to active category',()=>assert.match(ui,/activeCategories\.some\(\(category:any\)\s*=>\s*category\.code\s*===\s*c\.categoryCode\)/)],
 ['API component category code validation is bounded',()=>assert.match(api,/categoryCode:z\.string\(\)\.trim\(\)\.regex/)],
 ['API has fallback category list for configuration-free schools',()=>assert.match(api,/fallbackFeeCategoryCodes=\['TUITION','ADMISSION','TRANSPORT','BOOKS','UNIFORM','EXAM','OTHER'\]/)],
 ['API reads active finance categories in tenant scope',()=>assert.match(api,/SchoolFinanceConfiguration.*organizationId.*schoolId/)],
 ['API helper detects missing categories',()=>assert.match(api,/const missing=components\.filter\(component=>!component\.categoryCode\)/)],
 ['API helper rejects inactive/unknown category codes',()=>assert.match(api,/!activeCodes\.includes\(String\(component\.categoryCode\)/)],
 ['Create endpoint enforces category assignment',()=>assert.match(api,/Each fee component must select a configured fee category/)],
 ['Create endpoint rejects inactive/unknown categories',()=>assert.match(api,/Fee component uses an inactive or unknown category/)],
 ['Draft update enforces category checks when components change',()=>assert.match(api,/Each updated fee component must select a configured fee category/)],
 ['Existing draft updates remain scoped to DRAFT status',()=>assert.match(api,/Only draft fee structures can be edited/)],
 ['Root package registers P510 verifier',()=>assert.equal(rootPackage.scripts['verify:p510'],'node scripts/verify-p510-fee-structure-enhancements.mjs')],
 ['Modified frontend TSX parses',()=>assert.equal(uiDiagnostics.length,0)],
 ['Modified backend TS parses',()=>assert.equal(apiDiagnostics.length,0)],
 ['P510 phase report exists',()=>assert.ok(fs.existsSync('docs/phases/P510/P510-DELIVERY-REPORT.md'))]
];
let failed=0;
for(const [name,fn] of tests){try{fn();console.log(`PASS ${name}`)}catch(error){failed++;console.error(`FAIL ${name}: ${error.message}`)}}
console.log(`P510 focused assertions: ${tests.length-failed}/${tests.length} PASS`);
console.log(`Parser audit: UI diagnostics=${uiDiagnostics.length}, API diagnostics=${apiDiagnostics.length}`);
if(failed)process.exitCode=1;
