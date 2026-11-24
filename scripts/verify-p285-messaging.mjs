import fs from 'node:fs';
const schema=fs.readFileSync('backend/api/prisma/schema.prisma','utf8');
const route=fs.readFileSync('backend/api/src/modules/parents/parent.routes.ts','utf8');
const parent=fs.readFileSync('apps/parent-mobile/App.tsx','utf8');
const staff=fs.readFileSync('apps/school-admin/src/MessagingWorkspace.tsx','utf8');
const main=fs.readFileSync('apps/school-admin/src/main.tsx','utf8');
const mig=fs.readFileSync('backend/api/prisma/migrations/20261119230000_p285_school_messages/migration.sql','utf8');
const checks=[['Thread model',schema.includes('model SchoolMessageThread')],['Message model and relation',schema.includes('model SchoolMessage')&&schema.includes('thread SchoolMessageThread')],['Thread RLS',mig.includes('SchoolMessageThread_tenant_policy')],['Message RLS',mig.includes('SchoolMessage_tenant_policy')],['Parent create/list APIs',route.includes('/portal/messages')],['Parent ownership check',route.includes('createdBy:userId')],['Staff shared queue',route.includes("base+'/messages',authenticate")],['Parent reply and close',route.includes('/portal/messages/:threadId/reply')&&route.includes('/portal/messages/:threadId/close')],['Staff reply and close',route.includes('/messages/:threadId/reply')&&route.includes('/messages/:threadId/close')],['Notification fanout',route.includes('notifyMessageUsers')],['Parent messaging UI',parent.includes('Messages to school')&&parent.includes('Send message to school')],['Staff messaging workspace',staff.includes('Parent Messaging')],['Admin tab wired',main.includes('MessagingWorkspace')]];
let fail=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(!ok)fail++;}console.log(`${checks.length-fail}/${checks.length} checks passed`);if(fail)process.exit(1);
