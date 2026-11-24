import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = process.cwd();
const rootPkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const workspaceText = fs.readFileSync(path.join(root,'pnpm-workspace.yaml'),'utf8');
const checks=[];
function check(name, fn){try{fn(); checks.push({name,pass:true});}catch(e){checks.push({name,pass:false,error:e.message});}}
const workspaceDirs=['apps','backend','packages'];
check('workspace glob declarations cover apps/backend/packages',()=>{for(const d of workspaceDirs) assert.match(workspaceText,new RegExp(`\\b${d}\\/\\*`));});
const packageDirs=['packages/api-client','packages/domain-rules','packages/shared-types','packages/validation'];
const packageData=packageDirs.map(d=>({dir:d,pkg:JSON.parse(fs.readFileSync(path.join(root,d,'package.json'),'utf8'))}));
check('all shared package manifests parse',()=>assert.equal(packageData.length,4));
check('shared package names are unique',()=>assert.equal(new Set(packageData.map(x=>x.pkg.name)).size,4));
check('all shared package source entry targets exist',()=>{for(const {dir,pkg} of packageData){const target=pkg.exports?.['.']||pkg.exports||pkg.main||pkg.types;assert.ok(target,`${pkg.name} missing source entry`);assert.ok(fs.existsSync(path.join(root,dir,target)),`${pkg.name} entry target missing: ${target}`);}});
const workspacePackages=new Set();
function walk(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory()){if(ent.name==='node_modules'||ent.name==='.git')continue;walk(p);}else if(ent.name==='package.json'){try{const pkg=JSON.parse(fs.readFileSync(p,'utf8'));if(pkg.name)workspacePackages.add(pkg.name);}catch{}}}}
for(const d of workspaceDirs) walk(path.join(root,d));
check('workspace package names inventory is unique',()=>assert.equal(workspacePackages.size, new Set(workspacePackages).size));
const unresolved=[];
for(const {dir,pkg} of packageData){for(const [dep,version] of Object.entries({...pkg.dependencies,...pkg.devDependencies,...pkg.peerDependencies})){if(version==='workspace:*'&&!workspacePackages.has(dep))unresolved.push(`${pkg.name} -> ${dep}`);}}
check('shared package workspace:* dependencies resolve',()=>assert.deepEqual(unresolved,[]));
const consumerMap={};
for(const {pkg} of packageData) consumerMap[pkg.name]=[];
for(const d of [...workspaceDirs]){
 const base=path.join(root,d);
 const scan=(dir)=>{for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,ent.name);if(ent.isDirectory()){if(ent.name==='node_modules'||ent.name==='.git')continue;scan(p);}else if(/\.(ts|tsx|js|jsx|mjs)$/.test(ent.name)){let text='';try{text=fs.readFileSync(p,'utf8')}catch{};for(const name of Object.keys(consumerMap)){if(text.includes(name) && !path.relative(root,p).startsWith('packages/'))consumerMap[name].push(path.relative(root,p));}}}};
 scan(base);
}
check('consumer inventory generated for each shared package',()=>assert.equal(Object.keys(consumerMap).length,4));
check('root verify:p506 script is registered',()=>assert.equal(rootPkg.scripts['verify:p506'],'node scripts/verify-p506-shared-workspace-integration.mjs'));
const report={phase:'P506',title:'Shared Packages & Workspace Integration Audit',checks,total:checks.length,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass).length,workspacePackageCount:workspacePackages.size,sharedPackages:packageData.map(({dir,pkg})=>({name:pkg.name,dir,exportTarget:pkg.exports?.['.']||pkg.exports||pkg.main||pkg.types,sourceConsumers:[...new Set(consumerMap[pkg.name])]})),findings:{unusedSharedPackages:packageData.filter(({pkg})=>consumerMap[pkg.name].length===0).map(({pkg})=>pkg.name),sharedTypesDependencyDeclaredByBackend:JSON.parse(fs.readFileSync(path.join(root,'backend/api/package.json'),'utf8')).dependencies?.['@school-saas/shared-types']||null,unresolvedWorkspaceDependencies:unresolved}};
fs.mkdirSync(path.join(root,'docs/phases/P506'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/phases/P506/P506-VERIFICATION.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.failed) process.exit(1);
