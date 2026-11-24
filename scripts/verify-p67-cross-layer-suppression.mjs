import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const integration = read('backend/api/src/modules/notifications/suppression-hash-alias.test.ts');
const aliasHelper = read('backend/api/src/modules/notifications/suppression-hash-alias.ts');
const api = read('backend/api/src/modules/notifications/suppression.routes.ts');
const worker = read('backend/api/src/workers/notification-delivery-worker.ts');
const webhook = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const ui = read('apps/school-admin/src/NotificationSuppressionWorkspace.tsx');
const uiHelper = read('apps/school-admin/src/suppression-key-health.ts');
const uiTests = read('apps/school-admin/src/suppression-key-health.test.ts');
const checks = [
 ['cross-layer test exercises current and previous key versions', integration.includes('currentVersion: "v2"') && integration.includes('previousVersion: "v1"')],
 ['shared alias computation uses HMAC helper', aliasHelper.includes('hashSuppressionEmail(email, key.secret)')],
 ['active alias matcher requires matching version/hash and ACTIVE status', aliasHelper.includes('alias.status === "ACTIVE"') && aliasHelper.includes('lookup.has')],
 ['API creates and releases aliases', api.includes('notificationEmailSuppressionHashAlias.createMany') && api.includes('notificationEmailSuppressionHashAlias.updateMany')],
 ['worker uses shared active alias matcher', worker.includes('hasActiveSuppressionHashAlias(suppressionHashes, alias)')],
 ['webhook creates suppression aliases for bounce/complaint', webhook.includes('notificationEmailSuppressionHashAlias.create')],
 ['webhook retains manual release precedence', webhook.includes('shouldCreateProviderSuppression')],
 ['admin UI uses tested key-health row helper', ui.includes('buildSuppressionKeyHealthRows(keyHealth)')],
 ['admin UI helper aggregates key health counts', uiHelper.includes('activeAliases') && uiHelper.includes('outboxReferences')],
 ['admin UI helper tests current/previous and outbox-only versions', uiTests.includes('outbox references even if no alias exists')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P67 static verification failed');
console.log(`P67 static verification: ${checks.length}/${checks.length} PASS`);
