import fs from 'node:fs';
import assert from 'node:assert/strict';
const catalogue = fs.readFileSync('backend/api/src/modules/curriculum/board-packs.catalogue.ts', 'utf8');
const routes = fs.readFileSync('backend/api/src/modules/curriculum/curriculum.routes.ts', 'utf8');
const test = fs.readFileSync('backend/api/src/modules/curriculum/board-packs.catalogue.test.ts', 'utf8');
const expected = ['CBSE','CISCE_ICSE','CISCE_ISC','STATE','IB','IGCSE','CUSTOM'];
const checks = [
  ['P411 board pack catalogue exists', catalogue.includes('boardCurriculumPacks')],
  ['all supported board families represented', expected.every(key => catalogue.includes(`boardKey: "${key}"`))],
  ['pack stage mappings present', catalogue.includes('stageKeys:')],
  ['competency domain mappings present', catalogue.includes('competencyDomains:')],
  ['school localization guidance included', catalogue.includes('configurationGuidance:')],
  ['source provenance included', catalogue.includes('provenance:')],
  ['packs explicitly marked starter metadata', catalogue.includes('contentStatus: "STARTER_METADATA"')],
  ['non-official curriculum disclaimer explicit', catalogue.includes('not official') && catalogue.includes('not official Cambridge')],
  ['board key lookup helper exists', catalogue.includes('getBoardCurriculumPack(boardKey: string)')],
  ['all-pack read-only catalogue endpoint exists', routes.includes('/catalogue/board-packs') && routes.includes('officialContentIncluded: false')],
  ['single board-pack lookup endpoint exists', routes.includes('/catalogue/board-packs/:boardKey') && routes.includes('Board curriculum starter pack not found')],
  ['pack endpoint returns 404 for unsupported key', routes.includes('if (!pack) return res.status(404)')],
  ['catalogue tests cover board families', test.includes('includes one starter metadata pack for each supported board family')],
  ['catalogue tests cover provenance', test.includes('labels packs as starter metadata with non-official provenance')],
  ['catalogue tests cover lookup fallback', test.includes('case-insensitive pack lookup and returns null for unsupported keys')],
];
for (const [label, pass] of checks) { assert.ok(pass, label); console.log(`PASS ${label}`); }
console.log(`P411 verifier: ${checks.length}/${checks.length} passed`);
