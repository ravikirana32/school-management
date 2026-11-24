import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const base=JSON.parse(readFileSync('docs/phases/P454/C2-03-ROUTE-SECURITY-INVENTORY.json','utf8'));
const review=JSON.parse(readFileSync('docs/phases/P455/C2-03-HANDLER-SECURITY-REVIEW.json','utf8'));
const countRoutes=(path)=>{const s=readFileSync('backend/api/src/modules/'+path,'utf8');const re=/\b[A-Za-z_$][\w$]*\.(get|post|put|patch|delete|options|head)\s*\(\s*(["'`])[^\n]*?\2/g;let n=0;while(re.exec(s))n++;return n};
const checks=[
 ['review artifact declares P455/C2-03 F05',review.phase==='P455'&&review.feature.includes('C2-03 F05')],
 ['review inventory covers all P454 route modules',review.totalModules===base.routeModules.length&&review.modules.length===base.routeModules.length&&review.modules.map(x=>x.routeModule).sort().join('|')===base.routeModules.map(x=>x.path).sort().join('|')],
 ['all route endpoint registrations extracted',review.modules.every(m=>m.endpointCount===countRoutes(m.routeModule)&&m.endpointCount===m.endpoints.length)],
 ['each endpoint retains line and registration evidence',review.modules.every(m=>m.endpoints.every(e=>Number.isInteger(e.line)&&e.line>0&&typeof e.registrationSnippet==='string'&&e.registrationSnippet.length>0))],
 ['all endpoint review statuses remain explicit and conservative',review.modules.every(m=>m.endpoints.every(e=>e.reviewStatus==='REQUIRES_MANUAL_HANDLER_REVIEW'))],
 ['module-level indicators recorded',review.modules.every(m=>Array.isArray(m.moduleLevelIndicators))],
 ['review limitations documented',review.methodology.includes('not proof')&&review.modules.every(m=>m.endpoints.every(e=>e.evidenceLimitations.includes('does not prove')))],
 ['total endpoint count reconciles',review.totalEndpoints===review.modules.reduce((n,m)=>n+m.endpointCount,0)]
];let pass=0;for(const [name,ok] of checks){if(ok){pass++;console.log('PASS '+name)}else console.error('FAIL '+name)}console.log(`P455 handler-security-review verifier: ${pass}/${checks.length} PASS; endpoints=${review.totalEndpoints}`);if(pass!==checks.length)process.exit(1);
