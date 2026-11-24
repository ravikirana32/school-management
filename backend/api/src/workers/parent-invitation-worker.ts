import { Worker, Queue } from "bullmq";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { decryptInvitationPayload } from "../modules/parents/parent-invitations.js";
import { PARENT_DELIVERY_QUEUE } from "../modules/parents/parent-delivery-queue.js";
import { withParentWorkerContext } from "../modules/auth/tenant-context.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

function connection() {
  const url = new URL(env.REDIS_URL);
  return { host:url.hostname,port:Number(url.port||6379),...(url.username?{username:decodeURIComponent(url.username)}:{}),...(url.password?{password:decodeURIComponent(url.password)}:{}),...(url.protocol==="rediss:"?{tls:{}}:{}),...(url.pathname.length>1?{db:Number(url.pathname.slice(1))}:{}),maxRetriesPerRequest:null as null };
}
const redis=connection();
const deliveryQueue=new Queue(PARENT_DELIVERY_QUEUE,{connection:redis});
const deadLetters=new Queue(`${PARENT_DELIVERY_QUEUE}-dead-letter`,{connection:redis});

async function deliver(invitationId:string) {
  if(!env.PARENT_EMAIL_PROVIDER_URL||!env.PARENT_EMAIL_PROVIDER_TOKEN||!env.PARENT_EMAIL_FROM||!env.PARENT_PORTAL_BASE_URL) throw new Error("Parent email provider and portal URL must be configured");
  const invite=await withParentWorkerContext(prisma,tx=>tx.parentInvitation.findUnique({where:{id:invitationId}}));
  if(!invite||invite.status!=="PENDING"||invite.expiresAt<=new Date()) {
    if(invite?.status==="PENDING") await withParentWorkerContext(prisma,tx=>tx.parentInvitation.update({where:{id:invite.id},data:{status:"EXPIRED",deliveryStatus:"CANCELLED",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}}));
    return {skipped:true};
  }
  const payload=decryptInvitationPayload({deliveryCiphertext:invite.deliveryCiphertext,deliveryNonce:invite.deliveryNonce,deliveryTag:invite.deliveryTag});
  if(!env.PARENT_EMAIL_PROVIDER_URL.startsWith("https://")||!env.PARENT_PORTAL_BASE_URL.startsWith("https://"))throw new Error("Parent email provider and portal must use HTTPS");
  const portal=env.PARENT_PORTAL_BASE_URL.replace(/\/$/,"");
  const response=await fetch(env.PARENT_EMAIL_PROVIDER_URL,{signal:AbortSignal.timeout(20_000),method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${env.PARENT_EMAIL_PROVIDER_TOKEN}`,"idempotency-key":invite.id},body:JSON.stringify({from:env.PARENT_EMAIL_FROM,to:payload.email,subject:"Your school parent portal invitation",template:"school-parent-invitation",variables:{invitationUrl:`${portal}/accept-invitation#token=${encodeURIComponent(payload.token)}`,mobileInvitationUrl:`school-parent://accept-invitation?token=${encodeURIComponent(payload.token)}`,expiresAt:invite.expiresAt.toISOString(),consentVersion:invite.consentVersion,consentNoticeText:invite.consentNoticeText},metadata:{invitationId:invite.id}})});
  if(!response.ok) throw new Error(`Email provider returned HTTP ${response.status}`);
  await withParentWorkerContext(prisma,tx=>tx.parentInvitation.updateMany({where:{id:invite.id,status:"PENDING"},data:{deliveryStatus:"SENT",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}}));
  return {sent:true};
}

const worker=new Worker(PARENT_DELIVERY_QUEUE,async job=>{
  await withParentWorkerContext(prisma,tx=>tx.parentInvitation.updateMany({where:{id:job.data.invitationId,status:"PENDING"},data:{deliveryStatus:"PROCESSING",deliveryAttempts:{increment:1}}}));
  try { return await deliver(job.data.invitationId); }
  catch(error) { await withParentWorkerContext(prisma,tx=>tx.parentInvitation.updateMany({where:{id:job.data.invitationId,status:"PENDING"},data:{deliveryStatus:"RETRYING"}})); throw error; }
},{connection:redis,concurrency:5,limiter:{max:20,duration:60_000}});
worker.on("failed",(job,error)=>{
  if(job&&job.attemptsMade >= Number(job.opts.attempts||1)) void (async()=>{
    await withParentWorkerContext(prisma,tx=>tx.parentInvitation.updateMany({where:{id:job.data.invitationId,status:"PENDING"},data:{deliveryStatus:"FAILED",deliveryCiphertext:"",deliveryNonce:"",deliveryTag:""}}));
    await deadLetters.add("delivery-failed",{invitationId:job.data.invitationId,attempts:job.attemptsMade,errorCode:error.name},{removeOnComplete:false});
  })().catch(()=>undefined);
});

// Reconcile the encrypted DB outbox so API/Redis interruptions do not lose invitations.
async function reconcileOutbox(){
  const pending=await withParentWorkerContext(prisma,tx=>tx.parentInvitation.findMany({where:{status:"PENDING",OR:[{deliveryStatus:{in:["QUEUED","RETRYING"]}},{deliveryStatus:"PROCESSING",updatedAt:{lt:new Date(Date.now()-5*60_000)}}],expiresAt:{gt:new Date()}},select:{id:true},take:100,orderBy:{createdAt:"asc"}}));
  for(const item of pending) await deliveryQueue.add("deliver",{invitationId:item.id},{jobId:item.id,attempts:5,backoff:{type:"exponential",delay:30_000},removeOnComplete:{age:604800,count:5000},removeOnFail:false});
}
await reconcileOutbox();
const reconciliation=setInterval(()=>{void reconcileOutbox().catch(()=>undefined);},30_000);
const shutdown = createWorkerShutdown({
  clearTimers: () => clearInterval(reconciliation),
  closeWorker: () => worker.close(),
  closeQueues: async () => { await Promise.all([deliveryQueue.close(), deadLetters.close()]); },
  disconnectDatabase: () => prisma.$disconnect(),
});
process.once("SIGINT", () => { void shutdown().catch(error => { console.error("Parent delivery worker shutdown failed", error); process.exitCode = 1; }); });
process.once("SIGTERM", () => { void shutdown().catch(error => { console.error("Parent delivery worker shutdown failed", error); process.exitCode = 1; }); });
