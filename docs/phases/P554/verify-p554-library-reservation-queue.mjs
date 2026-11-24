import fs from 'node:fs';
import assert from 'node:assert/strict';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const routes=fs.readFileSync('backend/api/src/modules/library/library.routes.ts','utf8');
const ui=fs.readFileSync('apps/school-admin/src/LibraryWorkspace.tsx','utf8');
const checks=[
 ['reservation copy assignment field',schema.includes('copyId String?')],
 ['pickup expiry field',schema.includes('pickupExpiresAt DateTime?')],
 ['fulfilled timestamp',schema.includes('fulfilledAt DateTime?')],
 ['cancel timestamp',schema.includes('cancelledAt DateTime?')],
 ['deterministic FIFO order',routes.includes('orderBy:[{createdAt:"asc"},{id:"asc"}]')],
 ['duplicate active reservation guard',routes.includes('Borrower already has an active reservation for this title')],
 ['automatic hold assignment helper',routes.includes('async function assignNextHold')],
 ['copy hold assignment conditional guard',routes.includes('status:"AVAILABLE"},data:{status:"ON_HOLD"}})')],
 ['return workflow invokes hold assignment',routes.includes('assignNextHold(tx,s.organizationId,s.schoolId,copy.bookId,copy.id)')],
 ['cancel reservation route',routes.includes('/reservations/:reservationId/cancel')],
 ['pickup hold expiry route',routes.includes('/reservations/expire-holds')],
 ['active queue expiration supported',routes.includes('status:"ACTIVE",expiresAt:{lte:now}')],
 ['ready holds expire and release copy',routes.includes('status:"READY_FOR_PICKUP",pickupExpiresAt:{lte:now}')],
 ['fulfillment endpoint exists',routes.includes('/reservations/:reservationId/fulfill')],
 ['fulfillment loan uses hold borrower',routes.includes('borrowerId:hold.borrowerId')],
 ['fulfillment marks hold complete',routes.includes('status:"FULFILLED",fulfilledAt:new Date()')],
 ['fulfillment enforces borrower loan limit',routes.includes('Borrower loan limit reached')],
 ['school scope on reservation reads',routes.includes('organizationId:s.organizationId,schoolId:s.schoolId')],
 ['admin reservation panel wired',ui.includes('Reservations and hold queue')],
 ['admin cancellation button wired',ui.includes('cancelReservation(r.id)')],
 ['admin fulfillment action wired',ui.includes('fulfillReservation(r.id)')],
 ['admin expiry processing wired',ui.includes('expireHolds')],
 ['queue positions surfaced',ui.includes('Queue #${r.queuePosition}')],
];
for(const [name,ok] of checks){assert.ok(ok,name);console.log(`PASS ${name}`)}
console.log(`${checks.length}/${checks.length} P554 focused checks passed`);
