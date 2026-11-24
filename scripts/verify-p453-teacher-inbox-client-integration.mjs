import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const app=readFileSync('apps/teacher-mobile/App.tsx','utf8');
const checks=[
 ['pagination cursor state',app.includes('inboxCursor')],
 ['has-more state',app.includes('inboxHasMore')],
 ['server unread count state',app.includes('inboxUnreadCount')],
 ['page-envelope support in API helper',app.includes('includeEnvelope?{data:data.data,pagination:data.pagination,unreadCount:data.unreadCount}')],
 ['initial inbox request reads pagination envelope',app.includes("call('/parents/communications/inbox?limit=30','GET',undefined,undefined,true)")],
 ['cursor continuation request',app.includes('cursor=${encodeURIComponent(inboxCursor)}')],
 ['duplicate notification IDs prevented on append',app.includes('ids=new Set(current.map(item=>item.id))')],
 ['load-more UI exists',app.includes('Load more announcements')],
 ['load-more button disabled during offline/loading',app.includes('disabled={busy||offlineSession||inboxLoadingMore}')],
 ['read action updates unread badge',app.includes('setInboxUnreadCount(count=>Math.max(0,count-1))')],
 ['refresh resets pagination from first page',app.includes('setInboxCursor(page?.pagination?.nextCursor||null)')],
];
let pass=0; for(const [label,ok] of checks){if(ok){pass++;console.log(`PASS ${label}`)}else console.error(`FAIL ${label}`)}
console.log(`P453 source verifier: ${pass}/${checks.length} PASS`); if(pass!==checks.length)process.exit(1);
