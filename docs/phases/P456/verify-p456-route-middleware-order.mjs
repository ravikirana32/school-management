import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const evidence=JSON.parse(readFileSync('docs/phases/P456/C2-03-ROUTE-MIDDLEWARE-ORDER.json','utf8'));
const app=readFileSync(evidence.source,'utf8');
const checks=[
 ['phase and feature metadata',evidence.phase==='P456'&&evidence.feature.includes('C2-03 F06')],
 ['middleware evidence populated',evidence.middleware.length>0&&evidence.middleware.every(m=>Number.isInteger(m.line)&&m.expression)],
 ['middleware source lines exist',evidence.middleware.every(m=>app.split(/\r?\n/)[m.line-1]?.includes('app.use'))],
 ['route imports captured',evidence.imports.length>0&&evidence.imports.every(i=>i.router&&i.module)],
 ['mount evidence populated',evidence.mounts.length>0&&evidence.mounts.every(m=>m.basePath&&m.router&&Number.isInteger(m.line))],
 ['mount lines correspond to source',evidence.mounts.every(m=>app.split(/\r?\n/)[m.line-1]?.includes(`app.use("${m.basePath}"` )||app.split(/\r?\n/)[m.line-1]?.includes(`app.use("${m.basePath}"`))],
 ['mount order indexes are sequential',evidence.mounts.every((m,i)=>m.index===i+1)],
 ['unresolved mounts explicitly counted',evidence.summary.unresolvedMounts===evidence.mounts.filter(m=>m.sourceModule==='UNRESOLVED_IMPORT').length],
 ['limitations documented',evidence.limitations.length>=3&&evidence.methodology.includes('does not evaluate Express runtime semantics')],
 ['summary counts reconcile',evidence.summary.middlewareCount===evidence.middleware.length&&evidence.summary.routerImports===evidence.imports.length&&evidence.summary.routerMounts===evidence.mounts.length]
];let pass=0;for(const [name,ok] of checks){if(ok){pass++;console.log('PASS '+name)}else console.error('FAIL '+name)}console.log(`P456 route-middleware-order verifier: ${pass}/${checks.length} PASS`);if(pass!==checks.length)process.exit(1);
