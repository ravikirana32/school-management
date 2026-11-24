import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root = process.cwd();
const modules = path.join(root, "backend/api/src/modules");
const files = [];
function walk(dir) { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,entry.name); if(entry.isDirectory()) walk(p); else if(entry.isFile() && entry.name.endsWith(".routes.ts")) files.push(p); } }
walk(modules);
const routeRe = /\b([A-Za-z_$][\w$]*)\.(get|post|put|patch|delete)\s*\(/g;
const publicRules = {
  "auth/auth.routes.ts": ["/register","/login","/refresh","/logout","/password/reset","/password/forgot"],
  "billing/billing.routes.ts": ["/plans","/webhooks/:provider"],
  "parents/parent.routes.ts": ["/invitations/preview","/invitations/accept"],
  "notifications/delivery-webhook.routes.ts": ["/:provider"],
  "report-cards/report-card-verification.routes.ts": ["/report-cards/verify/:code"],
  "platform/platform.routes.ts": ["/tenant-context"],
  "documents/document.routes.ts": ["/internal/documents/:documentId/scan-result"],
  "admissions/admission.public.routes.ts": ["/intake-form", "/enquiries", "/applications", "/status/", "/applicant-account/"]
};
let total=0, protectedCount=0, publicCount=0;
const inventory=[];
for (const file of files) {
 const source=fs.readFileSync(file,"utf8");
 const rel=path.relative(modules,file).split(path.sep).join("/");
 const routerNames=new Set([...source.matchAll(/(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*Router\s*\(/g)].map(m=>m[1]));
 const mounted=new Set([...source.matchAll(/\b([A-Za-z_$][\w$]*)\.use\(\s*authenticate\b/g)].map(m=>m[1]));
 for (const match of source.matchAll(routeRe)) {
   const router=match[1];
   if(!routerNames.has(router)) continue;
   total++;
   const tail=source.slice(match.index,match.index+1000);
   const pathMatch=tail.match(/\w+\.(?:get|post|put|patch|delete)\s*\(\s*([^,\n]+)/);
   const pathExpr=pathMatch?.[1]?.trim() ?? "(unknown path)";
   const isProtected=mounted.has(router) || /\bauthenticate\b/.test(tail.slice(0,350));
   if(isProtected) protectedCount++;
   else {
     publicCount++;
     const allowed=publicRules[rel] ?? [];
     assert(allowed.some(rule=>pathExpr.includes(rule)), `Unreviewed unauthenticated route ${rel}:${source.slice(0,match.index).split("\n").length} ${pathExpr}`);
   }
   inventory.push({file:rel,router,method:match[2].toUpperCase(),path:pathExpr,classification:isProtected?"AUTHENTICATED":"PUBLIC_EXCEPTION"});
 }
}
console.log({total,protectedCount,publicCount});


const app=fs.readFileSync(path.join(root,"backend/api/src/app.ts"),"utf8");
for (const marker of ["/api/v1/auth", "/api/v1/webhooks/notifications", "/api/v1/public", "/api/v1/billing"]) assert(app.includes(marker),`Missing expected router mount ${marker}`);
const gap=fs.readFileSync(path.join(root,"MASTER-OPEN-GAPS-REGISTER.md"),"utf8");
const docsGap=fs.readFileSync(path.join(root,"docs/MASTER-OPEN-GAPS-REGISTER.md"),"utf8");
assert.equal(gap,docsGap,"Root/docs master gap registers differ");
console.log(JSON.stringify({routeDeclarations:total,authenticated:protectedCount,explicitPublicExceptions:publicCount,routeFiles:files.length,unclassifiedPublicRoutes:0,rootDocsGapParity:true},null,2));
