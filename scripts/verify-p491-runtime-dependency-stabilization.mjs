import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const checks=[];
const ok=(name,pass,detail='')=>checks.push({name,pass:Boolean(pass),detail});
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const rootPkg=readJson('package.json');
ok('root package metadata parses',rootPkg.name==='school-management-saas' && rootPkg.packageManager==='pnpm@9.15.0');
ok('Node engine range declared',rootPkg.engines?.node==='>=22 <23');
ok('workspace file exists',fs.existsSync(path.join(root,'pnpm-workspace.yaml')));
const mobile=['student-mobile','parent-mobile','teacher-mobile','staff-mobile'];
const expected={expo:'~52.0.25',react:'18.3.1','react-native':'0.76.6','@types/react':'~18.3.12','typescript':'~5.7.2'};
for (const app of mobile) {
 const pkg=readJson(`apps/${app}/package.json`);
 ok(`${app} manifest parses`,pkg.name===`@school-saas/${app}`);
 for (const [dep,version] of Object.entries(expected)) {
  const actual=pkg.dependencies?.[dep]??pkg.devDependencies?.[dep];
  ok(`${app} ${dep} version consistent`,actual===version,`expected ${version}, found ${actual??'missing'}`);
 }
 ok(`${app} Expo scripts declared`,['start','android','ios','build','typecheck'].every(s=>typeof pkg.scripts?.[s]==='string'));
 ok(`${app} app.json exists`,fs.existsSync(path.join(root,`apps/${app}/app.json`)));
 ok(`${app} tsconfig exists`,fs.existsSync(path.join(root,`apps/${app}/tsconfig.json`)));
}
const results=checks.filter(c=>!c.pass);
console.log(`P491 runtime/dependency stabilization: ${checks.length-results.length}/${checks.length} passed`);
for(const c of checks) console.log(`${c.pass?'PASS':'FAIL'} ${c.name}${c.detail?` — ${c.detail}`:''}`);
if(results.length) process.exitCode=1;
