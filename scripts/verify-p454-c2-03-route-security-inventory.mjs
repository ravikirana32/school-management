import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root='backend/api/src/modules'; const walk=(dir)=>{let a=[];for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())a=a.concat(walk(p));else if(e.name.endsWith('.routes.ts'))a.push(p.replace('backend/api/src/modules/',''));}return a.sort()};
const actual=walk(root);const inventory=JSON.parse(readFileSync('C2-03-ROUTE-SECURITY-INVENTORY.json','utf8'));const listed=inventory.routeModules.map(x=>x.path).sort();
const checks=[['inventory is versioned and non-empty',inventory.version===1&&listed.length>0],['all route modules represented',JSON.stringify(actual)===JSON.stringify(listed)],['no duplicate inventory paths',new Set(listed).size===listed.length],['all modules assigned a review classification',inventory.routeModules.every(x=>['PUBLIC_OR_TOKEN_GATED_REVIEW','AUTHENTICATION','AUTHENTICATED_REVIEW_REQUIRED'].includes(x.classification))],['review note present for every module',inventory.routeModules.every(x=>typeof x.reviewNote==='string'&&x.reviewNote.length>10)],['classification legend present',Object.keys(inventory.classificationLegend||{}).length===3]];
let pass=0;for(const [n,ok] of checks){if(ok){pass++;console.log('PASS '+n)}else console.error('FAIL '+n)}
console.log(`P454 route security inventory verifier: ${pass}/${checks.length} PASS`);console.log('Inventory is a review aid; it does not prove route-level authorization or tenant isolation.');if(pass!==checks.length)process.exit(1);
