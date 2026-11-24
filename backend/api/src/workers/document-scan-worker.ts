import { Worker, Queue } from "bullmq";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { createScanDownloadUrl, deleteObject } from "../modules/documents/document-storage.js";
import { DOCUMENT_SCAN_QUEUE } from "../modules/documents/document-scan-queue.js";
import { withDocumentWorkerContext } from "../modules/auth/tenant-context.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";
import { operationsAlertDedupeKey, operationsAlertSeverity } from "../modules/operations/alert-contract.js";

function connection(){const u=new URL(env.REDIS_URL);return {host:u.hostname,port:Number(u.port||6379),...(u.username?{username:decodeURIComponent(u.username)}:{}),...(u.password?{password:decodeURIComponent(u.password)}:{}),...(u.protocol==="rediss:"?{tls:{}}:{}),...(u.pathname.length>1?{db:Number(u.pathname.slice(1))}:{}),maxRetriesPerRequest:null as null};}
const redis=connection();const queue=new Queue(DOCUMENT_SCAN_QUEUE,{connection:redis});const deadLetters=new Queue(`${DOCUMENT_SCAN_QUEUE}-dead-letter`,{connection:redis});
async function dispatch(kind:"student"|"staff"|"homework"|"school-logo"|"refund-evidence"|"admission",documentId:string){
 if(!env.DOCUMENT_SCANNER_PROVIDER_URL||!env.DOCUMENT_SCANNER_PROVIDER_TOKEN||!env.DOCUMENT_SCAN_CALLBACK_URL)throw new Error("Document scanner provider, token and callback URL must be configured");
 const document=await withDocumentWorkerContext(prisma,async tx=>kind==="student"?tx.studentDocument.findUnique({where:{id:documentId}}):kind==="staff"?tx.staffDocument.findUnique({where:{id:documentId}}):kind==="homework"?tx.homeworkSubmissionAttachment.findUnique({where:{id:documentId}}):kind==="school-logo"?tx.schoolBrandAsset.findUnique({where:{id:documentId}}):kind==="admission"?tx.admissionApplicationDocument.findUnique({where:{id:documentId}}):tx.studentFeeRefundReconciliationEvidence.findUnique({where:{id:documentId}}).then(row=>row?{...row,objectKey:row.referenceValue}:null));
 if(!document||document.securityStatus!=="QUARANTINED")return {skipped:true};
 if(!env.DOCUMENT_SCANNER_PROVIDER_URL.startsWith("https://")||!env.DOCUMENT_SCAN_CALLBACK_URL.startsWith("https://"))throw new Error("Scanner provider and callback must use HTTPS");
 const downloadUrl=await createScanDownloadUrl(document.objectKey);
 const callbackUrl=`${env.DOCUMENT_SCAN_CALLBACK_URL.replace(/\/$/,"")}/${encodeURIComponent(document.id)}/scan-result`;
 const response=await fetch(env.DOCUMENT_SCANNER_PROVIDER_URL,{signal:AbortSignal.timeout(20_000),method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${env.DOCUMENT_SCANNER_PROVIDER_TOKEN}`,"idempotency-key":`${kind}-${document.id}`},body:JSON.stringify({documentId:document.id,kind,downloadUrl,downloadUrlExpiresInSeconds:120,objectKey:document.objectKey,declaredMimeType:document.mimeType,callbackUrl,callback:{method:"POST",signatureHeader:"x-document-scan-signature",timestampHeader:"x-document-scan-timestamp",signatureFormat:"hex HMAC-SHA256(timestamp + '.' + rawRequestBody)",maximumTimestampSkewSeconds:300},requiredChecks:["malware","file-signature","mime-detection","malformed-file"]})});
 if(!response.ok)throw new Error(`Scanner provider returned HTTP ${response.status}`);
 await withDocumentWorkerContext(prisma,tx=>kind==="student"?tx.studentDocument.updateMany({where:{id:document.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}):kind==="staff"?tx.staffDocument.updateMany({where:{id:document.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}):kind==="homework"?tx.homeworkSubmissionAttachment.updateMany({where:{id:document.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}):kind==="school-logo"?tx.schoolBrandAsset.updateMany({where:{id:document.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}):kind==="admission"?tx.admissionApplicationDocument.updateMany({where:{id:document.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}):tx.studentFeeRefundReconciliationEvidence.updateMany({where:{id:document.id,securityStatus:"QUARANTINED"},data:{scanRequestedAt:new Date()}}));
 return {submitted:true};
}
const worker=new Worker(DOCUMENT_SCAN_QUEUE,job=>dispatch(job.data.kind,job.data.documentId),{connection:redis,concurrency:3,limiter:{max:10,duration:60_000}});
worker.on("failed",(job,error)=>{if(job&&job.attemptsMade>=Number(job.opts.attempts||1)){
 void deadLetters.add("scan-dispatch-failed",{kind:job.data.kind,documentId:job.data.documentId,errorCode:error.name},{removeOnComplete:false}).then(()=>enqueueTypedOperationsAlert("DOCUMENT_SCAN_DEAD_LETTER",`${job.data.kind}:${job.data.documentId}`,{kind:job.data.kind,documentId:job.data.documentId,errorCode:error.name,attempts:job.attemptsMade},new Date().toISOString().slice(0,13))).catch(()=>undefined);
 }});

// Expire abandoned refund-evidence uploads. Storage deletion happens before the
// guarded state transition so a transient S3 failure leaves the row retryable.
const ABANDONED_UPLOAD_TTL_MS = 24 * 60 * 60 * 1000;
async function expireAbandonedAdmissionUploads(){
 const cutoff=new Date(Date.now()-24*60*60_000);
 const stale=await withDocumentWorkerContext(prisma,tx=>tx.admissionApplicationDocument.findMany({where:{securityStatus:"PENDING_UPLOAD",createdAt:{lt:cutoff}},select:{id:true,objectKey:true},take:100}));
 let expired=0;
 for(const item of stale){try{await deleteObject(item.objectKey);const changed=await withDocumentWorkerContext(prisma,tx=>tx.admissionApplicationDocument.updateMany({where:{id:item.id,securityStatus:"PENDING_UPLOAD"},data:{securityStatus:"REJECTED",status:"REJECTED",reviewNotes:"Upload expired before completion"}}));if(changed.count)expired++;}catch(error){const code=(error instanceof Error?error.name:"UnknownError").slice(0,80);console.error("Admission document expiry cleanup failed",{documentId:item.id,errorCode:code});await enqueueOperationsAlert("ADMISSION_DOCUMENT_CLEANUP_FAILED",`admission-document:${item.id}`,{documentId:item.id,errorCode:code},"WARNING").catch(()=>undefined);}}
 return {examined:stale.length,expired};
}
async function expireAbandonedRefundEvidence(){
 const cutoff = new Date(Date.now() - ABANDONED_UPLOAD_TTL_MS);
 const stale = await withDocumentWorkerContext(prisma, tx => tx.studentFeeRefundReconciliationEvidence.findMany({
  where:{securityStatus:"PENDING_UPLOAD",referenceType:"STORAGE_KEY",createdAt:{lt:cutoff},OR:[{cleanupNextRetryAt:null},{cleanupNextRetryAt:{lte:new Date()}}]},
  select:{id:true,referenceValue:true,cleanupAttemptCount:true},take:100,orderBy:{createdAt:"asc"}
 }));
 let expired=0;
 for(const item of stale){
  try {
   await withDocumentWorkerContext(prisma, async tx => {
    await tx.$queryRawUnsafe("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",`refund-evidence-expiry:${item.id}`);
    const current=await tx.studentFeeRefundReconciliationEvidence.findFirst({where:{id:item.id,securityStatus:"PENDING_UPLOAD",referenceType:"STORAGE_KEY"},select:{id:true,referenceValue:true,createdAt:true}});
    if(!current||current.createdAt>=cutoff)return;
    await deleteObject(current.referenceValue);
    const changed=await tx.studentFeeRefundReconciliationEvidence.updateMany({where:{id:current.id,securityStatus:"PENDING_UPLOAD"},data:{securityStatus:"REJECTED",cleanupLastErrorAt:null,cleanupLastErrorCode:null,cleanupNextRetryAt:null}});
    if(changed.count)expired++;
   });
  } catch(error) {
   // Persist failure metadata so Finance can see and explicitly retry cleanup.
   const errorCode=(error instanceof Error?error.name:"UnknownError").slice(0,80);
   await withDocumentWorkerContext(prisma,tx=>tx.studentFeeRefundReconciliationEvidence.updateMany({where:{id:item.id,securityStatus:"PENDING_UPLOAD"},data:{cleanupLastErrorAt:new Date(),cleanupLastErrorCode:errorCode,cleanupAttemptCount:{increment:1},cleanupNextRetryAt:new Date(Date.now()+Math.min(6*60*60_000,60_000*Math.pow(2,Math.min(8,item.cleanupAttemptCount+1))))}})).catch(()=>undefined);
   console.error("Refund evidence expiry cleanup failed",{evidenceId:item.id,errorCode});
   await enqueueTypedOperationsAlert("REFUND_EVIDENCE_CLEANUP_FAILED",item.id,{evidenceId:item.id,errorCode,attempt: item.cleanupAttemptCount+1},new Date().toISOString().slice(0,13)).catch(()=>undefined);
  }
 }
 return {examined:stale.length,expired};
}

const WORKER_NAME="document-scan-worker";
async function enqueueOperationsAlert(eventType:string,dedupeKey:string,payload:Record<string,unknown>,severity="WARNING"){
 await prisma.$executeRawUnsafe(`INSERT INTO "OperationsAlertOutbox" ("id","dedupeKey","eventType","severity","payload","status","nextAttemptAt","createdAt","updatedAt") VALUES (gen_random_uuid()::text,$1,$2,$3,$4::jsonb,'PENDING',NOW(),NOW(),NOW()) ON CONFLICT ("dedupeKey") DO NOTHING`,dedupeKey,eventType,severity,JSON.stringify(payload));
}
async function enqueueTypedOperationsAlert(eventType: keyof typeof import("../modules/operations/alert-contract.js").OPERATIONS_ALERTS,subject:string,payload:Record<string,unknown>,windowKey:string){
 const severity=operationsAlertSeverity(eventType);
 const dedupeKey=operationsAlertDedupeKey(eventType,subject,windowKey);
 const domain=eventType.startsWith("DOCUMENT")?"documents":eventType.startsWith("REFUND")?"evidence":"operations";
 await enqueueOperationsAlert(eventType,dedupeKey,{...payload,domain,occurredAt:new Date().toISOString()},severity);
}
// P163 retention: keep acknowledged, successfully delivered alert history for 90 days.
async function pruneOperationsAlertHistory(){
 const removed=await prisma.$executeRawUnsafe(`DELETE FROM "OperationsAlertOutbox" WHERE "status"='DELIVERED' AND "acknowledgedAt" IS NOT NULL AND "createdAt"<NOW()-INTERVAL '90 days'`);
 if(removed)console.info("Pruned retained operational alerts",{removed,retentionDays:90});
 return removed;
}
// P441: independently monitor the reminder-policy audit export worker and alert on degraded/stale transitions.
const EXPORT_WORKER_NAME="reminder-policy-audit-export-worker";
const EXPORT_WORKER_STALE_MS=env.REMINDER_AUDIT_EXPORT_WORKER_ALERT_STALE_SECONDS*1000;
const EXPORT_WORKER_DEGRADED_FAILURES=env.REMINDER_AUDIT_EXPORT_WORKER_ALERT_DEGRADED_FAILURES;
let exportWorkerAlertState:"UNKNOWN"|"HEALTHY"|"DEGRADED"|"STALE"="UNKNOWN";
async function monitorReminderAuditExportWorker(){
 const rows=await prisma.$queryRawUnsafe<Array<{status:string;lastHeartbeatAt:Date;consecutiveFailures:number;lastErrorCode:string|null}>>(`SELECT "status","lastHeartbeatAt","consecutiveFailures","lastErrorCode" FROM "BackgroundWorkerHeartbeat" WHERE "workerName"=$1 LIMIT 1`,EXPORT_WORKER_NAME);
 const row=rows[0]; const now=new Date();
 const state=!row?"UNKNOWN":now.getTime()-row.lastHeartbeatAt.getTime()>EXPORT_WORKER_STALE_MS?"STALE":row.status;
 if(state==="STALE"&&exportWorkerAlertState!=="STALE"){
  await enqueueOperationsAlert("REMINDER_AUDIT_EXPORT_WORKER_STALE",`REMINDER_AUDIT_EXPORT_WORKER_STALE:${EXPORT_WORKER_NAME}:${Math.floor(now.getTime()/3600000)}`,{workerName:EXPORT_WORKER_NAME,health:state,heartbeatAgeMs:row?Math.max(0,now.getTime()-row.lastHeartbeatAt.getTime()):null,staleAfterMs:EXPORT_WORKER_STALE_MS,occurredAt:now.toISOString()},"CRITICAL");
 }else if(state==="DEGRADED"&&exportWorkerAlertState!=="DEGRADED"&&(row?.consecutiveFailures||0)>=EXPORT_WORKER_DEGRADED_FAILURES){
  await enqueueOperationsAlert("REMINDER_AUDIT_EXPORT_WORKER_DEGRADED",`REMINDER_AUDIT_EXPORT_WORKER_DEGRADED:${EXPORT_WORKER_NAME}:${Math.floor(now.getTime()/3600000)}`,{workerName:EXPORT_WORKER_NAME,health:state,consecutiveFailures:row?.consecutiveFailures||0,errorCode:row?.lastErrorCode||"UnknownError",occurredAt:now.toISOString()},"CRITICAL");
 }else if(state==="HEALTHY"&&(exportWorkerAlertState==="DEGRADED"||exportWorkerAlertState==="STALE")){
  const event=exportWorkerAlertState==="STALE"?"REMINDER_AUDIT_EXPORT_WORKER_RECOVERED_FROM_STALE":"REMINDER_AUDIT_EXPORT_WORKER_RECOVERED";
  await enqueueOperationsAlert(event,`${event}:${EXPORT_WORKER_NAME}:${Math.floor(now.getTime()/3600000)}`,{workerName:EXPORT_WORKER_NAME,health:state,occurredAt:now.toISOString()},"INFO");
 }
 exportWorkerAlertState=state as typeof exportWorkerAlertState;
}
// P442: escalate delivered critical export-worker alerts that remain unacknowledged.
async function escalateUnacknowledgedExportWorkerAlerts(){
 const thresholdSeconds=env.REMINDER_AUDIT_EXPORT_WORKER_ALERT_ESCALATE_AFTER_SECONDS;
 const candidates=await prisma.$queryRawUnsafe<Array<{id:string;eventType:string;createdAt:Date;payload:unknown}>>(`SELECT "id","eventType","createdAt","payload" FROM "OperationsAlertOutbox" WHERE "eventType" IN ('REMINDER_AUDIT_EXPORT_WORKER_STALE','REMINDER_AUDIT_EXPORT_WORKER_DEGRADED') AND "severity"='CRITICAL' AND "status"='DELIVERED' AND "acknowledgedAt" IS NULL AND "escalatedAt" IS NULL AND "createdAt"<=NOW()-($1::int * INTERVAL '1 second') ORDER BY "createdAt" ASC LIMIT 25`,thresholdSeconds);
 for(const alert of candidates){
  const claimed=await prisma.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "escalatedAt"=NOW(),"escalationLevel"=1,"updatedAt"=NOW() WHERE "id"=$1 AND "acknowledgedAt" IS NULL AND "escalatedAt" IS NULL`,alert.id);
  if(!claimed)continue;
  const eventType='REMINDER_AUDIT_EXPORT_WORKER_ESCALATED';
  await enqueueOperationsAlert(eventType,`${eventType}:${alert.id}`,{originalAlertId:alert.id,originalEventType:alert.eventType,ageSeconds:Math.floor((Date.now()-alert.createdAt.getTime())/1000),thresholdSeconds,escalationLevel:1,occurredAt:new Date().toISOString()},'CRITICAL');
 }
}
// P449: execute the persisted P448 per-severity policy with recipient-aware events.
const OPERATIONS_ALERT_POLICY_DEFAULTS={enabled:true,severities:{INFO:{recipientUserIds:[],reminderMinutes:60,escalationMinutes:240},WARNING:{recipientUserIds:[],reminderMinutes:30,escalationMinutes:120},ERROR:{recipientUserIds:[],reminderMinutes:15,escalationMinutes:60},CRITICAL:{recipientUserIds:[],reminderMinutes:5,escalationMinutes:15}}} as const;
type OperationsAlertSeverity="INFO"|"WARNING"|"ERROR"|"CRITICAL";
type OperationsAlertPolicyRule={recipientUserIds:string[];reminderMinutes:number;escalationMinutes:number};
function normalizeOperationsAlertPolicy(raw:any){
 const base=OPERATIONS_ALERT_POLICY_DEFAULTS;
 if(!raw||typeof raw!="object"||typeof raw.enabled!="boolean"||!raw.severities)return base;
 const severities:Record<OperationsAlertSeverity,OperationsAlertPolicyRule>={} as any;
 for(const severity of ["INFO","WARNING","ERROR","CRITICAL"] as const){const rule=raw.severities[severity];if(!rule||!Array.isArray(rule.recipientUserIds)||!Number.isInteger(rule.reminderMinutes)||rule.reminderMinutes<1||rule.reminderMinutes>1440||!Number.isInteger(rule.escalationMinutes)||rule.escalationMinutes<1||rule.escalationMinutes>10080)return base;severities[severity]={recipientUserIds:[...new Set(rule.recipientUserIds.filter((id:any)=>typeof id==="string"&&id.trim()).map((id:string)=>id.trim()))],reminderMinutes:rule.reminderMinutes,escalationMinutes:rule.escalationMinutes};}
 return {enabled:raw.enabled,severities};
}
// P450: recipient fan-out creates independently deduplicated delivery/retry records.
async function enqueueRecipientRoutedOperationsAlert(tx:any,eventType:string,baseDedupeKey:string,eventSeverity:string,payload:Record<string,unknown>,recipientUserIds:string[]){
 const recipients=[...new Set((recipientUserIds||[]).filter((id)=>typeof id==="string"&&id.trim()).map(id=>id.trim()))];
 const channelSetting=await tx.platformControlSetting.findUnique({where:{key:"operations_alert_channel_preferences"},select:{value:true}}).catch(()=>null);
 const channelConfig=channelSetting?.value&&typeof channelSetting.value==="object"?channelSetting.value as any:{};
 const defaultChannels=Array.isArray(channelConfig.defaultChannels)?channelConfig.defaultChannels:["WEBHOOK"];
 const preferenceRows=Array.isArray(channelConfig.userPreferences)?channelConfig.userPreferences:[];
 const channelsFor=(userId:string|null)=>userId?((preferenceRows.find((p:any)=>p?.userId===userId&&Array.isArray(p.channels))?.channels)||defaultChannels):defaultChannels;
 const targets=recipients.length?recipients.filter(userId=>channelsFor(userId).includes("WEBHOOK")):(defaultChannels.includes("WEBHOOK")?[null]:[]);
 for(const recipientUserId of targets){
  const dedupeKey=recipientUserId?`${baseDedupeKey}:recipient:${recipientUserId}`:baseDedupeKey;
  const deliveryPayload={...payload,deliveryMode:recipientUserId?"RECIPIENT_WEBHOOK":"LEGACY_WEBHOOK",recipientUserId,preferredChannels:channelsFor(recipientUserId)};
  const sql='INSERT INTO \"OperationsAlertOutbox\" (\"id\",\"dedupeKey\",\"eventType\",\"severity\",\"payload\",\"status\",\"nextAttemptAt\",\"createdAt\",\"updatedAt\") VALUES (gen_random_uuid()::text,$1,$2,$3,$4::jsonb,\'PENDING\',NOW(),NOW(),NOW()) ON CONFLICT (\"dedupeKey\") DO NOTHING';
  await tx.$executeRawUnsafe(sql,dedupeKey,eventType,eventSeverity,JSON.stringify(deliveryPayload));
 }
 return targets.length;
}
async function automateOperationsAlertSla(){
 const setting=await prisma.platformControlSetting.findUnique({where:{key:"operations_alert_policy"},select:{value:true,updatedAt:true}});
 const policy=normalizeOperationsAlertPolicy(setting?.value);
 const policyVersion=setting?.updatedAt?.toISOString()??"default";
 if(!policy.enabled)return {reminders:0,escalations:0,policyEnabled:false,policyVersion};
 let reminderCount=0,escalationCount=0;
 for(const severity of ["INFO","WARNING","ERROR","CRITICAL"] as const){
  const rule=policy.severities[severity];
  const reminders=await prisma.$transaction(async tx=>{
   const rows=await tx.$queryRawUnsafe<Array<{id:string;eventType:string;severity:string;slaDueAt:Date;assignedToUserId:string|null}>>(`UPDATE "OperationsAlertOutbox" SET "slaReminderSentAt"=NOW(),"updatedAt"=NOW() WHERE "id" IN (SELECT "id" FROM "OperationsAlertOutbox" WHERE "severity"=$1 AND "resolvedAt" IS NULL AND "acknowledgedAt" IS NULL AND "slaDueAt">NOW() AND "slaDueAt"<=NOW()+($2::int * INTERVAL '1 minute') AND "slaReminderSentAt" IS NULL ORDER BY "slaDueAt" ASC LIMIT 50 FOR UPDATE SKIP LOCKED) RETURNING "id","eventType","severity","slaDueAt","assignedToUserId"`,severity,rule.reminderMinutes);
   for(const alert of rows){const eventType="OPERATIONS_ALERT_SLA_REMINDER";const dedupeKey=`${eventType}:${alert.id}`;await enqueueRecipientRoutedOperationsAlert(tx,eventType,dedupeKey,"WARNING",{originalAlertId:alert.id,originalEventType:alert.eventType,severity:alert.severity,slaDueAt:alert.slaDueAt,assignedToUserId:alert.assignedToUserId,recipientUserIds:rule.recipientUserIds,reminderWindowMinutes:rule.reminderMinutes,policyVersion,occurredAt:new Date().toISOString()},rule.recipientUserIds);}
   return rows.length;
  });
  reminderCount+=reminders;
  const escalations=await prisma.$transaction(async tx=>{
   const rows=await tx.$queryRawUnsafe<Array<{id:string;eventType:string;severity:string;slaDueAt:Date;assignedToUserId:string|null;createdAt:Date}>>(`UPDATE "OperationsAlertOutbox" SET "slaEscalationSentAt"=NOW(),"escalatedAt"=COALESCE("escalatedAt",NOW()),"escalationLevel"=GREATEST(COALESCE("escalationLevel",0),1),"updatedAt"=NOW() WHERE "id" IN (SELECT "id" FROM "OperationsAlertOutbox" WHERE "severity"=$1 AND "resolvedAt" IS NULL AND "acknowledgedAt" IS NULL AND "slaDueAt"<=NOW()-($2::int * INTERVAL '1 minute') AND "slaEscalationSentAt" IS NULL ORDER BY "slaDueAt" ASC LIMIT 50 FOR UPDATE SKIP LOCKED) RETURNING "id","eventType","severity","slaDueAt","assignedToUserId","createdAt"`,severity,rule.escalationMinutes);
   for(const alert of rows){const eventType="OPERATIONS_ALERT_SLA_OVERDUE_ESCALATION";const dedupeKey=`${eventType}:${alert.id}`;await enqueueRecipientRoutedOperationsAlert(tx,eventType,dedupeKey,"CRITICAL",{originalAlertId:alert.id,originalEventType:alert.eventType,severity:alert.severity,slaDueAt:alert.slaDueAt,assignedToUserId:alert.assignedToUserId,recipientUserIds:rule.recipientUserIds,overdueMinutes:Math.max(0,Math.floor((Date.now()-alert.slaDueAt.getTime())/60000)),escalationAfterMinutes:rule.escalationMinutes,escalationLevel:1,policyVersion,occurredAt:new Date().toISOString()},rule.recipientUserIds);}
   return rows.length;
  });
  escalationCount+=escalations;
 }
 return {reminders:reminderCount,escalations:escalationCount,policyEnabled:true,policyVersion};
}
async function deliverOperationsAlerts(){
 if(!env.OPERATIONS_ALERT_WEBHOOK_URL||!env.OPERATIONS_ALERT_WEBHOOK_TOKEN)return;
 const due=await prisma.$queryRawUnsafe<Array<{id:string;dedupeKey:string;eventType:string;severity:string;payload:unknown;attempts:number}>>(`SELECT "id","dedupeKey","eventType","severity","payload","attempts" FROM "OperationsAlertOutbox" WHERE ("status" IN ('PENDING','RETRY') AND "nextAttemptAt"<=NOW()) OR ("status"='SENDING' AND "updatedAt"<NOW()-INTERVAL '2 minutes') ORDER BY "createdAt" ASC LIMIT 20`);
 for(const alert of due){
  const claimed=await prisma.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "status"='SENDING',"attempts"="attempts"+1,"updatedAt"=NOW() WHERE "id"=$1 AND ("status" IN ('PENDING','RETRY') OR ("status"='SENDING' AND "updatedAt"<NOW()-INTERVAL '2 minutes'))`,alert.id); if(!claimed)continue;
  try{const response=await fetch(env.OPERATIONS_ALERT_WEBHOOK_URL,{method:'POST',signal:AbortSignal.timeout(10_000),headers:{'content-type':'application/json',authorization:`Bearer ${env.OPERATIONS_ALERT_WEBHOOK_TOKEN}`,'idempotency-key':alert.dedupeKey},body:JSON.stringify({id:alert.id,eventType:alert.eventType,severity:alert.severity,deliveryAttempt:alert.attempts+1,...(alert.payload as object)})});if(!response.ok)throw new Error(`Alert provider HTTP ${response.status}`);await prisma.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "status"='DELIVERED',"deliveredAt"=NOW(),"lastErrorCode"=NULL,"updatedAt"=NOW() WHERE "id"=$1`,alert.id);}
  catch(error){const code=(error instanceof Error?error.name:'UnknownError').slice(0,80);const delay=Math.min(6*60*60_000,30_000*Math.pow(2,Math.min(10,alert.attempts)));await prisma.$executeRawUnsafe(`UPDATE "OperationsAlertOutbox" SET "status"='RETRY',"lastErrorCode"=$2,"nextAttemptAt"=NOW()+($3::int * INTERVAL '1 millisecond'),"updatedAt"=NOW() WHERE "id"=$1`,alert.id,code,delay).catch(()=>undefined);}
 }
}
async function heartbeat(status:"HEALTHY"|"DEGRADED"|"STARTING",errorCode?:string){
 const previous=await prisma.$queryRawUnsafe<Array<{status:string;consecutiveFailures:number}>>(`SELECT "status","consecutiveFailures" FROM "BackgroundWorkerHeartbeat" WHERE "workerName"=$1`,WORKER_NAME);
 const now=new Date();
 await prisma.$executeRawUnsafe(`INSERT INTO "BackgroundWorkerHeartbeat" ("workerName","status","lastHeartbeatAt","lastSuccessAt","lastErrorAt","lastErrorCode","consecutiveFailures","updatedAt") VALUES ($1,$2,$3,CASE WHEN $2='HEALTHY' THEN $3 ELSE NULL END,CASE WHEN $2='DEGRADED' THEN $3 ELSE NULL END,$4,CASE WHEN $2='DEGRADED' THEN 1 ELSE 0 END,$3) ON CONFLICT ("workerName") DO UPDATE SET "status"=EXCLUDED."status","lastHeartbeatAt"=EXCLUDED."lastHeartbeatAt","lastSuccessAt"=CASE WHEN EXCLUDED."status"='HEALTHY' THEN EXCLUDED."lastHeartbeatAt" ELSE "BackgroundWorkerHeartbeat"."lastSuccessAt" END,"lastErrorAt"=CASE WHEN EXCLUDED."status"='DEGRADED' THEN EXCLUDED."lastHeartbeatAt" ELSE "BackgroundWorkerHeartbeat"."lastErrorAt" END,"lastErrorCode"=COALESCE(EXCLUDED."lastErrorCode","BackgroundWorkerHeartbeat"."lastErrorCode"),"consecutiveFailures"=CASE WHEN EXCLUDED."status"='HEALTHY' THEN 0 ELSE "BackgroundWorkerHeartbeat"."consecutiveFailures"+1 END,"updatedAt"=EXCLUDED."updatedAt"`,WORKER_NAME,status,now,errorCode||null);
 if(status==="DEGRADED"){
  const failures=(previous[0]?.consecutiveFailures||0)+1;
  if(failures>=env.DOCUMENT_WORKER_FAILURE_ALERT_THRESHOLD)await enqueueOperationsAlert("DOCUMENT_WORKER_DEGRADED",`${WORKER_NAME}:DEGRADED`,{workerName:WORKER_NAME,status,consecutiveFailures:failures,errorCode:errorCode||"UnknownError",occurredAt:now.toISOString()},"CRITICAL");
 }else if(status==="HEALTHY"&&previous[0]?.status==="DEGRADED"){
  await enqueueOperationsAlert("DOCUMENT_WORKER_RECOVERED",`${WORKER_NAME}:RECOVERED:${now.toISOString().slice(0,13)}`,{workerName:WORKER_NAME,status,occurredAt:now.toISOString()},"INFO");
 }
 await deliverOperationsAlerts().catch(()=>undefined);
}
async function runExpiryWithHealth(){try{const result=await expireAbandonedRefundEvidence();const admissions=await expireAbandonedAdmissionUploads();await heartbeat("HEALTHY");if(result.expired)console.info("Expired abandoned refund evidence uploads",result);if(admissions.expired)console.info("Expired abandoned admission document uploads",admissions);return {refundEvidence:result,admissionDocuments:admissions};}catch(error){const code=(error instanceof Error?error.name:"UnknownError").slice(0,80);await heartbeat("DEGRADED",code).catch(()=>undefined);console.error("Refund evidence expiry sweep failed",{errorCode:code});throw error;}}

async function reconcile(){
 const pending=await withDocumentWorkerContext(prisma,async tx=>{
  const [students,staff,homework,logos,admissions,evidence]=await Promise.all([tx.studentDocument.findMany({where:{securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:new Date(Date.now()-10*60_000)}}]},select:{id:true},take:100}),tx.staffDocument.findMany({where:{securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:new Date(Date.now()-10*60_000)}}]},select:{id:true},take:100}),tx.homeworkSubmissionAttachment.findMany({where:{securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:new Date(Date.now()-10*60_000)}}]},select:{id:true},take:100}),tx.schoolBrandAsset.findMany({where:{securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:new Date(Date.now()-10*60_000)}}]},select:{id:true},take:100}),tx.admissionApplicationDocument.findMany({where:{securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:new Date(Date.now()-10*60_000)}}]},select:{id:true},take:100}),tx.studentFeeRefundReconciliationEvidence.findMany({where:{securityStatus:"QUARANTINED",OR:[{scanRequestedAt:null},{scanRequestedAt:{lt:new Date(Date.now()-10*60_000)}}]},select:{id:true},take:100})]);
  return [...students.map(row=>({kind:"student" as const,id:row.id})),...staff.map(row=>({kind:"staff" as const,id:row.id})),...homework.map(row=>({kind:"homework" as const,id:row.id})),...logos.map(row=>({kind:"school-logo" as const,id:row.id})),...admissions.map(row=>({kind:"admission" as const,id:row.id})),...evidence.map(row=>({kind:"refund-evidence" as const,id:row.id}))];
 });
 for(const item of pending)await queue.add("scan",{kind:item.kind,documentId:item.id},{jobId:`${item.kind}-${item.id}`,attempts:5,backoff:{type:"exponential",delay:20_000},removeOnComplete:{age:600,count:10000},removeOnFail:{age:600,count:10000}});
}
await heartbeat("STARTING").catch(()=>undefined);await monitorReminderAuditExportWorker().catch(()=>undefined);await pruneOperationsAlertHistory().catch(()=>undefined);await reconcile();void runExpiryWithHealth().catch(()=>undefined);const healthTimer=setInterval(()=>{void heartbeat("HEALTHY").catch(()=>undefined);void monitorReminderAuditExportWorker().catch(()=>undefined);void escalateUnacknowledgedExportWorkerAlerts().catch(()=>undefined);void automateOperationsAlertSla().catch(()=>undefined);void deliverOperationsAlerts().catch(()=>undefined);},30_000);const timer=setInterval(()=>{void reconcile().catch(error=>{const code=(error instanceof Error?error.name:"UnknownError").slice(0,80);void heartbeat("DEGRADED",code).catch(()=>undefined);});},30_000);const expiryTimer=setInterval(()=>{void runExpiryWithHealth().catch(()=>undefined);},5*60_000);const alertRetentionTimer=setInterval(()=>{void pruneOperationsAlertHistory().catch(()=>undefined);},24*60*60_000);
const shutdown = createWorkerShutdown({
 clearTimers:()=>{clearInterval(timer);clearInterval(expiryTimer);clearInterval(healthTimer);clearInterval(alertRetentionTimer);},
 closeWorker:()=>worker.close(),
 closeQueues:async()=>{await Promise.all([queue.close(),deadLetters.close()]);},
 disconnectDatabase:()=>prisma.$disconnect(),
});
process.once("SIGINT",()=>{void shutdown().catch(error=>{console.error("Document scan worker shutdown failed",error);process.exitCode=1;});});
process.once("SIGTERM",()=>{void shutdown().catch(error=>{console.error("Document scan worker shutdown failed",error);process.exitCode=1;});});
