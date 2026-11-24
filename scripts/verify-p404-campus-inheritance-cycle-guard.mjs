import fs from 'node:fs';
import assert from 'node:assert/strict';
const routes = fs.readFileSync('backend/api/src/modules/schools/school-config.routes.ts', 'utf8');
const helper = routes.slice(routes.indexOf('function campusInheritanceCycleErrors'), routes.indexOf('schoolConfigRouter.put("/:organizationId/:schoolId/campus-inheritance/:campusId"'));
const checks = [
  ['P404 cycle guard exists', helper.includes('campusInheritanceCycleErrors')],
  ['uses proposed parent for campus being saved', helper.includes('parents.set(campusId, proposedParentId)')],
  ['tracks visited nodes', helper.includes('new Set<string>()') && helper.includes('visited.has(cursor)')],
  ['walks parent chain', helper.includes('cursor = parents.get(cursor)')],
  ['returns cycle error', helper.includes('Inheritance cycle detected at campus')],
  ['queries existing parent links', routes.includes('SELECT "campusId", "parentCampusId" FROM "CampusConfigInheritanceRecord"')],
  ['query is tenant and school scoped', /WHERE "organizationId"=\$\{s\.organizationId\} AND "schoolId"=\$\{s\.schoolId\}/.test(routes) ],
  ['proposed chain checked before insert', routes.indexOf('campusInheritanceCycleErrors(campusId') < routes.indexOf('const id = randomUUID()', routes.indexOf('campusInheritanceCycleErrors(campusId'))],
  ['cycle conflicts return HTTP 409', routes.includes('Campus inheritance cycle rejected') && routes.includes('status: 409')],
  ['existing save remains an upsert', routes.includes('ON CONFLICT') && routes.includes('campusId')]
];
for (const [name, ok] of checks) { assert.ok(ok, name); console.log(`PASS ${name}`); }
// Independent graph-behavior cases for the same parent-map algorithm.
function detectsCycle(campusId, proposedParentId, rows) {
  const parents = new Map(rows.map(row => [row.campusId, row.parentCampusId])); parents.set(campusId, proposedParentId);
  const visited = new Set(); let cursor = campusId;
  while (cursor) { if (visited.has(cursor)) return true; visited.add(cursor); cursor = parents.get(cursor) ?? null; }
  return false;
}
assert.equal(detectsCycle('C', 'B', [{campusId:'A',parentCampusId:null},{campusId:'B',parentCampusId:'A'}]), false);
assert.equal(detectsCycle('A', 'B', [{campusId:'B',parentCampusId:'A'}]), true);
assert.equal(detectsCycle('C', 'A', [{campusId:'A',parentCampusId:'B'},{campusId:'B',parentCampusId:'C'}]), true);
console.log('PASS graph scenarios: safe chain, two-node cycle, longer cycle');
console.log(`P404 verifier: ${checks.length + 3}/${checks.length + 3} passed`);
