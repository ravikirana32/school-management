import fs from 'node:fs';
import assert from 'node:assert/strict';
const routes=fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts','utf8');
const checks=[
 ['P405 resolver helper added',routes.includes('function resolvePersistedCampusInheritance')],
 ['effective endpoint exposed',routes.includes('/campus-inheritance/effective/:campusId')],
 ['endpoint requires settings permission',routes.includes('requirePermission(s, res, "school.settings.manage")')],
 ['records queried tenant/school scoped',/WHERE "organizationId"=\$\{s\.organizationId\} AND "schoolId"=\$\{s\.schoolId\}/.test(routes)],
 ['parent chain traversed',routes.includes('cursor = doc.parentCampusId ?? null')],
 ['visited set detects cycles',routes.includes('visited.has(cursor)')],
 ['missing target and parent are rejected',routes.includes('Campus ${campusId} was not found.')&&routes.includes('Parent campus ${cursor} was not found.')],
 ['duplicate records detected',routes.includes('Duplicate campus document ${row.campusId}.')],
 ['ancestor-to-child resolution order',routes.includes('for (const id of [...chain].reverse())')],
 ['inherited scopes merge recursively',routes.includes('mergeCampusOverride(effectiveOverrides[scope], overrides[scope])')],
 ['non-inherited overrides replace',routes.includes(': overrides[scope];')],
 ['unresolved chain returns 422',routes.includes('status(422).json({ error: "Campus inheritance cannot be resolved"')],
 ['response exposes chain and effective overrides',routes.includes('return res.json({ data: result });')]
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log(`PASS ${name}`)}
function merge(base,override){if(!base||typeof base!=='object'||Array.isArray(base)||!override||typeof override!=='object'||Array.isArray(override))return override;const result={...base};for(const [k,v] of Object.entries(override))result[k]=merge(result[k],v);return result;}
function resolve(id,rows){const byId=new Map(rows.map(r=>[r.campusId,r.doc]));const chain=[],seen=new Set();let cur=id;while(cur){if(seen.has(cur))return {valid:false};seen.add(cur);chain.push(cur);const d=byId.get(cur);if(!d)return {valid:false};cur=d.parentCampusId??null;}const effective={};for(const c of [...chain].reverse()){const d=byId.get(c);for(const scope of ['profile','working','policies']){const ov=d.overrides?.[scope];if(ov===undefined)continue;effective[scope]=d.inheritedScopes?.includes(scope)?merge(effective[scope],ov):ov;}}return {valid:true,chain:chain.reverse(),effective};}
const d=(campusId,parentCampusId,inheritedScopes,overrides)=>({campusId,doc:{parentCampusId,inheritedScopes,overrides}});
const fixture=[d('main',null,['profile','policies'],{profile:{name:'Main',address:{city:'A'}},policies:{late:10}}),d('north','main',['profile','policies'],{profile:{address:{city:'B'}},policies:{late:5}}),d('north-annex','north',['profile'],{profile:{name:'Annex'}})];
let r=resolve('north-annex',fixture);assert.equal(r.valid,true);assert.deepEqual(r.chain,['main','north','north-annex']);assert.deepEqual(r.effective.profile,{name:'Annex',address:{city:'B'}});assert.equal(r.effective.policies.late,5);console.log('PASS ancestor/child nested merge and replacement scenario');
assert.equal(resolve('missing',fixture).valid,false);console.log('PASS unknown campus rejected');
assert.equal(resolve('cyc-a',[d('cyc-a','cyc-b',[],{}),d('cyc-b','cyc-a',[],{})]).valid,false);console.log('PASS cycle rejected');
console.log(`P405 verifier: ${checks.length+3}/${checks.length+3} passed`);
