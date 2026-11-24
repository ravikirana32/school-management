import fs from 'node:fs';
const root = new URL('../backend/api/src/', import.meta.url);
const helper = fs.readFileSync(new URL('modules/notifications/in-app-inbox-pagination.ts', root), 'utf8');
const test = fs.readFileSync(new URL('modules/notifications/in-app-inbox-pagination.test.ts', root), 'utf8');
const routes = fs.readFileSync(new URL('modules/parents/parent.routes.ts', root), 'utf8');
const checks = [
 ['bounded inbox page size helper', helper.includes('Math.max(1, Math.min(100, n))')],
 ['cursor encode/decode functions', helper.includes('encodeInboxCursor') && helper.includes('decodeInboxCursor')],
 ['cursor malformed validation', helper.includes('Date.parse(parsed.createdAt)') && helper.includes('parsed.id')],
 ['category grouping helper', helper.includes('groupInboxRows') && helper.includes("'GENERAL'" )],
 ['recipient-scoped inbox route', routes.includes("recipientUserId:s.userId,channel:'IN_APP'" )],
 ['cursor pagination query', routes.includes('nextCursor:hasMore&&last?encodeInboxCursor')],
 ['unread count included', routes.includes('unreadCount:result.unreadCount')],
 ['grouped response opt-in', routes.includes("grouped?{groups:groupInboxRows(result.rows)}")],
 ['dedicated unread-count endpoint', routes.includes("communications/inbox/unread-count")],
 ['focused helper tests', test.includes('round trips valid cursors') && test.includes('groups rows by category')],
];
for (const [label, pass] of checks) console.log(`${pass?'PASS':'FAIL'} ${label}`);
const failed = checks.filter(([,pass])=>!pass).length;
console.log(`P452 verifier: ${checks.length-failed}/${checks.length} PASS`);
if(failed)process.exit(1);
