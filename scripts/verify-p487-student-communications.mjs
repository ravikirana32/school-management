import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'apps/student-mobile/App.tsx'),'utf8');
const center=fs.readFileSync(path.join(root,'apps/student-mobile/src/StudentCommunicationCenter.tsx'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'apps/student-mobile/package.json'),'utf8'));
const rootPkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const gaps=fs.readFileSync(path.join(root,'docs/MASTER-OPEN-GAPS-REGISTER.md'),'utf8');
const checks=[
 ['Communication center component exists',fs.existsSync(path.join(root,'apps/student-mobile/src/StudentCommunicationCenter.tsx'))],
 ['Component exported',center.includes('export function StudentCommunicationCenter')],
 ['Typed notification item contract',center.includes('StudentCommunicationItem')],
 ['All/read/unread filter options',center.includes('"all" | "unread" | "read"')],
 ['Unread count displayed',center.includes('unreadCount')],
 ['Search field with accessibility label',center.includes('Search school communications')],
 ['Search covers title and body',center.includes('payload?.title')&&center.includes('payload?.body')],
 ['Search covers category and priority',center.includes('payload?.category')&&center.includes('payload?.priority')],
 ['Newest-first ordering',center.includes('sort((a, b) => Date.parse(b.createdAt')],
 ['Read/unread states surfaced',center.includes(' · READ')&&center.includes(' · NEW')],
 ['Mark-as-read callback wired',center.includes('onMarkRead(id)')],
 ['Busy/duplicate action guard',center.includes('if (marking || busy) return')],
 ['Mark-read button disabled while busy',center.includes('disabled={busy || marking !== null}')],
 ['Empty filter/search message',center.includes('No communications match this filter or search.')],
 ['Empty inbox message',center.includes('No announcements available.')],
 ['Refresh callback button',center.includes('onPress={onRefresh}')],
 ['App imports communication center',app.includes('StudentCommunicationCenter')],
 ['App replaces legacy inbox card',app.includes('<StudentCommunicationCenter items={announcements}')],
 ['Existing mark-read API preserved',app.includes('/inbox/${encodeURIComponent(id)}/read')],
 ['Student mobile verifier registered',pkg.scripts?.['verify:p487']==='node ../../scripts/verify-p487-student-communications.mjs'],
 ['Root verifier registered',rootPkg.scripts?.['verify:p487']==='node scripts/verify-p487-student-communications.mjs'],
 ['Gap register P487 entry',gaps.includes('## P487 — C2-06 Student Communication Center')],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)failed++;}
console.log(`P487 static assertions: ${checks.length-failed}/${checks.length}`);
if(failed)process.exit(1);
