import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import net from 'node:net';
const root=process.cwd();
const command=(name,args=['--version'])=>{try{const r=spawnSync(name,args,{cwd:root,encoding:'utf8',timeout:4000});return {available:r.status===0,version:(r.stdout||r.stderr||'').trim().split('\n')[0]};}catch{return {available:false,version:''};}};
const portProbe=(port,host='127.0.0.1',timeout=800)=>new Promise(resolve=>{const s=net.createConnection({host,port});let done=false;const finish=ok=>{if(done)return;done=true;s.destroy();resolve(ok)};s.setTimeout(timeout);s.once('connect',()=>finish(true));s.once('timeout',()=>finish(false));s.once('error',()=>finish(false));});
const pnpm=command('pnpm'); const docker=command('docker'); const npm=command('npm'); const node=command('node');
const localExpo=fs.existsSync(path.join(root,'node_modules/.bin/expo'))||fs.existsSync(path.join(root,'apps/student-mobile/node_modules/.bin/expo'));
const checks=[
 ['Node.js available',node.available,node.version],['npm available',npm.available,npm.version],['pnpm available',pnpm.available,pnpm.version||'pnpm not installed/on PATH'],['Docker CLI available',docker.available,docker.version||'Docker not installed/on PATH'],['workspace lockfile present',fs.existsSync(path.join(root,'pnpm-lock.yaml')),'pnpm-lock.yaml'],['workspace config present',fs.existsSync(path.join(root,'pnpm-workspace.yaml')),'pnpm-workspace.yaml'],['compose file present',fs.existsSync(path.join(root,'docker-compose.yml')),'docker-compose.yml'],['Expo CLI dependency installed',localExpo,localExpo?'local Expo CLI found':'local Expo CLI not installed'],['API package manifest present',fs.existsSync(path.join(root,'backend/api/package.json')),'backend/api/package.json'],['four mobile app manifests present',['student','parent','teacher','staff'].every(n=>fs.existsSync(path.join(root,`apps/${n}-mobile/package.json`))),'Student/Parent/Teacher/Staff']
];
for(const [label,port] of [['PostgreSQL localhost:5432',5432],['Redis localhost:6379',6379],['API localhost:8080',8080]]) checks.push([`${label} TCP reachable`,await portProbe(port),`TCP probe to 127.0.0.1:${port}`]);
console.log('Runtime acceptance preflight (no credentials printed)');
for(const [name,pass,detail] of checks) console.log(`${pass?'PASS':'BLOCKED'} ${name}${detail?` — ${detail}`:''}`);
const blocked=checks.filter(c=>!c[1]);console.log(`Preflight summary: ${checks.length-blocked.length}/${checks.length} prerequisites ready; ${blocked.length} blocked/unavailable`);
console.log('Note: prerequisite checks are not substitutes for dependency install, build, API/database tests, or device acceptance.');
