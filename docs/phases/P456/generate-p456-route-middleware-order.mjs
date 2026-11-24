import { readFileSync, writeFileSync } from 'node:fs';
const appPath='backend/api/src/app.ts';
const source=readFileSync(appPath,'utf8');
const lines=source.split(/\r?\n/);
const imports=[];
for (const line of lines) {
  const m=line.match(/^import\s+\{([^}]+)\}\s+from\s+["'](.+modules\/.+\.routes\.js)["'];?/);
  if(m){ const names=m[1].split(',').map(x=>x.trim()).filter(Boolean); for(const name of names) imports.push({router:name,module:m[2].replace(/^\.\/modules\//,'').replace(/\.js$/,'')+'.ts'}); }
}
const middleware=[]; const mounts=[];
for(let i=0;i<lines.length;i++){
 const line=lines[i];
 const middlewareMatch=line.match(/^app\.use\((.+)\);?$/);
 if(middlewareMatch){
  const expr=middlewareMatch[1];
  const isMount=/^\s*["']/.test(expr);
  if(isMount){ const m=expr.match(/^\s*["']([^"']+)["']\s*,\s*([A-Za-z_$][\w$]*)/); if(m) mounts.push({line:i+1,basePath:m[1],router:m[2]}); }
  else middleware.push({line:i+1,expression:expr,classification:/resolveTenantDomain/.test(expr)?'TENANT_CONTEXT':/requestMetricsMiddleware/.test(expr)?'OBSERVABILITY':/requestTracingMiddleware/.test(expr)?'TRACING':/pinoHttp/.test(expr)?'REQUEST_LOGGING':/express\.json/.test(expr)?'BODY_PARSER':/cors/.test(expr)?'CORS':/helmet/.test(expr)?'SECURITY_HEADERS':'GENERAL_MIDDLEWARE'});
 }
}
const appRouteLines=lines.map((line,i)=>({line:i+1,text:line.trim()})).filter(x=>/^app\.(get|post|put|patch|delete|options|head)\s*\(/.test(x.text));
const mountOrder=mounts.map((m,index)=>({...m,index:index+1,sourceModule:imports.find(x=>x.router===m.router)?.module||'UNRESOLVED_IMPORT'}));
const artifact={phase:'P456',feature:'C2-03 F06 — Route Registration & Middleware Order Verification',source:appPath,methodology:'Deterministic source extraction of app-level middleware declarations, router imports, app.use mounts, mount order and direct app route registrations. This does not evaluate Express runtime semantics, router-local middleware, conditional registration, or authorization correctness.',middleware,imports,mounts:mountOrder,directAppRoutes:appRouteLines,summary:{middlewareCount:middleware.length,routerImports:imports.length,routerMounts:mounts.length,directAppRoutes:appRouteLines.length,unresolvedMounts:mountOrder.filter(m=>m.sourceModule==='UNRESOLVED_IMPORT').length},limitations:['Only top-level backend/api/src/app.ts declarations are parsed.','Router-local middleware order and nested router mounts are not fully traced.','Source ordering is evidence, not runtime proof of authorization.','Conditional or dynamic registration may not be captured.']};
writeFileSync('docs/phases/P456/C2-03-ROUTE-MIDDLEWARE-ORDER.json',JSON.stringify(artifact,null,2)+'\n');
console.log(`Generated P456 evidence: middleware=${middleware.length}, imports=${imports.length}, mounts=${mounts.length}, direct routes=${appRouteLines.length}, unresolved=${artifact.summary.unresolvedMounts}`);
