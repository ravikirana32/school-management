import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
const inventory=JSON.parse(readFileSync('docs/phases/P454/C2-03-ROUTE-SECURITY-INVENTORY.json','utf8'));
const root='backend/api/src/modules';
const records=[];
for(const module of inventory.routeModules){
 const file=join(root,module.path); const source=readFileSync(file,'utf8');
 const lines=source.split(/\r?\n/); const endpoints=[];
 const re=/\b([A-Za-z_$][\w$]*)\.(get|post|put|patch|delete|options|head)\s*\(\s*(["'`])([^\n]*?)\3/g;
 for(let m; (m=re.exec(source));){const line=source.slice(0,m.index).split(/\r?\n/).length; const full=lines[line-1]?.trim()||'';
  const context=lines.slice(Math.max(0,line-3),Math.min(lines.length,line+8)).join('\n');
  const indicators=[];
  for(const token of ['authenticate','requireAuth','hasSchoolPermission','hasSchoolAdminAccess','hasActiveSchoolMembership','withTenantContext','requirePermission','requireRole','scope(','authorize','permission']) if(context.includes(token)) indicators.push(token);
  endpoints.push({router:m[1],method:m[2].toUpperCase(),path:m[4].trim().replace(/\s*\)\s*.*$/,''),line,registrationSnippet:full.slice(0,300),nearbyAuthorizationIndicators:[...new Set(indicators)],reviewStatus:'REQUIRES_MANUAL_HANDLER_REVIEW',evidenceLimitations:'Nearby source token scan only; does not prove authorization logic or tenant scoping.'});
 }
 const moduleIndicators=[]; for(const token of ['.use(authenticate)','authenticate','withTenantContext','hasSchoolPermission','hasSchoolAdminAccess','requireRole']) if(source.includes(token))moduleIndicators.push(token);
 records.push({routeModule:module.path,classificationFromP454:module.classification,moduleLevelIndicators:moduleIndicators,endpointCount:endpoints.length,endpoints});
}
const output={phase:'P455',feature:'C2-03 F05 Handler-level authorization and scope review coverage',generatedAt:'source-derived; deterministic generator',methodology:'Static extraction of Express-like router method calls and nearby/module-level authorization token indicators. Every endpoint remains marked REQUIRES_MANUAL_HANDLER_REVIEW; indicators are not proof.',modules:records,totalModules:records.length,totalEndpoints:records.reduce((n,r)=>n+r.endpointCount,0)};
writeFileSync('docs/phases/P455/C2-03-HANDLER-SECURITY-REVIEW.json',JSON.stringify(output,null,2)+'\n');
console.log(`Generated handler review inventory: ${output.totalModules} modules, ${output.totalEndpoints} endpoints`);
