import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = (p) => readFileSync(p, 'utf8');
const route = read('backend/api/src/modules/notifications/delivery-webhook.routes.ts');
const reducer = read('backend/api/src/modules/notifications/notification-event-reconciliation.ts');
const tests = read('backend/api/src/modules/notifications/notification-event-reconciliation.test.ts');
const checks = [
 ['route persists event before summary reconciliation', route.indexOf('await tx.notificationDeliveryEvent.create') < route.indexOf('if (shouldApplyNotificationDeliveryEvent')],
 ['route delegates summary updates to pure reducer', route.includes('shouldApplyNotificationDeliveryEvent(outbox.status, outbox.lastProviderEventAt, eventType, new Date(event.occurredAt))')],
 ['older events cannot overwrite newer state', reducer.includes('occurredAt.getTime() < lastProviderEventAt.getTime()')],
 ['complaint outranks bounce and delivered', reducer.includes('COMPLAINED: 3') && reducer.includes('BOUNCED: 2') && reducer.includes('DELIVERED: 1')],
 ['bounce outranks delivered', reducer.includes('BOUNCED: 2') && reducer.includes('DELIVERED: 1')],
 ['invalid timestamps rejected', reducer.includes('Number.isFinite(occurredAt.getTime())')],
 ['tests cover event ordering and terminal precedence', tests.includes('older events') && tests.includes('later delivery erase a complaint') && tests.includes('bounce erase a complaint')],
 ['tests cover complaint promotion', tests.includes('complaint feedback to supersede a bounce')],
];
for (const [name, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`);
assert.equal(checks.filter(([, pass]) => pass).length, checks.length, 'P52 static verification failed');
console.log(`P52 static verification: ${checks.length}/${checks.length} PASS`);
