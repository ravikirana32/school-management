import fs from 'node:fs';
const app=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const component=fs.readFileSync('apps/parent-mobile/src/communication/ParentCommunicationSummary.tsx','utf8');
const checks=[
 ['communication summary module exists and exported',component.includes('export function ParentCommunicationSummary')],
 ['pure communication summarizer exported',component.includes('export function summarizeParentCommunication')],
 ['unread notices are identified by readAt',component.includes('notices.filter(n => !n.readAt)')],
 ['unread notification categories aggregated',component.includes('unreadByCategory[category] = (unreadByCategory[category] || 0) + 1')],
 ['server unread count is normalized and reconciled',component.includes('Math.max(unread.length, validServerUnread)')],
 ['open conversations identified case-insensitively',component.includes('String(t.status || "").toUpperCase() === "OPEN"')],
 ['latest notice/message activity is calculated',component.includes('Math.max(...latestDates)')],
 ['invalid activity timestamps ignored',component.includes('Number.isFinite(Date.parse(value as string))')],
 ['categories presented in stable order',component.includes('sort(([a], [b]) => a.localeCompare(b))')],
 ['unread and open thread tiles rendered',component.includes('Unread notifications')&&component.includes('Open conversations')],
 ['category count summary rendered',component.includes('Unread by category:')],
 ['latest activity display rendered',component.includes('Latest loaded communication:')],
 ['component imported into parent app',app.includes('import { ParentCommunicationSummary } from "./src/communication/ParentCommunicationSummary"')],
 ['component integrated with parent-school communication state',app.includes('<ParentCommunicationSummary notices={notifications} threads={messageThreads} unreadCount={notificationUnread}/>')],
 ['message list and notification list preserved',app.includes('School notifications · {notificationUnread} unread')&&app.includes('Messages to school')],
 ['school changes clear school-scoped messaging state',app.includes('setMessageThreads([]);setThreadReplyDrafts({});setBusy(true);setError("");try{await loadChildren(school);')],
 ['message actions remain online-only',app.includes('Contact the school office and continue an existing conversation. Messages require an online connection.')],
 ['summary component does not perform network mutations',!component.includes('fetch(')&&!component.includes('onPress=')]
];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
