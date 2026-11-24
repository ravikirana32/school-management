import { prisma } from "../lib/prisma.js";
import { withPlatformContext, withTenantContext } from "../modules/auth/tenant-context.js";
import { notifyHostelLeaveGuardians } from "../modules/hostel/hostel-leave-notifications.js";
import { createWorkerShutdown } from "./graceful-shutdown.js";

const WORKER_NAME="hostel-leave-return-monitor";
const INTERVAL_MS=Number(process.env.HOSTEL_LEAVE_MONITOR_INTERVAL_MS||60_000);
let running=false;

/** Converts only departed, overdue residents to LATE_RETURN and notifies consented guardians once. */
async function reconcile(){
 if(running)return;running=true;
 try{
  const now=new Date();
  const due=await withPlatformContext(prisma,tx=>tx.hostelLeaveRequest.findMany({
   where:{status:"APPROVED",expectedReturn:{lt:now},gatePasses:{some:{status:"CHECKED_OUT"}}},
   select:{id:true,organizationId:true,schoolId:true,studentId:true,expectedReturn:true},take:200,orderBy:{expectedReturn:"asc"}
  }));
  let changed=0;
  for(const leave of due){
   const didChange=await withTenantContext(prisma,{organizationId:leave.organizationId,schoolId:leave.schoolId,userId:"HOSTEL_LEAVE_RETURN_MONITOR"},async tx=>{
    const update=await tx.hostelLeaveRequest.updateMany({
     where:{id:leave.id,organizationId:leave.organizationId,schoolId:leave.schoolId,status:"APPROVED",expectedReturn:{lt:now}},
     data:{status:"LATE_RETURN",lateReturnAt:now,lateReturnNote:"Expected return time elapsed; resident gate-pass remains checked out."}
    });
    if(update.count!==1)return false;
    await tx.auditLog.create({data:{actorUserId:null,organizationId:leave.organizationId,schoolId:leave.schoolId,action:"HOSTEL_LEAVE_MARKED_LATE",resourceType:"HostelLeaveRequest",resourceId:leave.id,outcome:"SUCCESS",metadata:{expectedReturn:leave.expectedReturn.toISOString(),detectedAt:now.toISOString()}}});
    await notifyHostelLeaveGuardians(tx,{organizationId:leave.organizationId,schoolId:leave.schoolId,leaveRequestId:leave.id,studentId:leave.studentId,eventType:"LATE_RETURN",title:"Hostel resident return overdue",body:"The expected hostel return time has passed and the resident has not yet checked back in. Please contact the hostel office if needed.",createdBy:"HOSTEL_LEAVE_RETURN_MONITOR"});
    return true;
   });
   if(didChange)changed++;
  }
  if(changed)console.info(`[${WORKER_NAME}] marked ${changed} overdue hostel leave request(s)`);
 }catch(error){console.error(`[${WORKER_NAME}] reconciliation failed`,error instanceof Error?error.message:"UnknownError");}
 finally{running=false;}
}
await reconcile();
const timer=setInterval(()=>{void reconcile();},INTERVAL_MS);
const shutdown=createWorkerShutdown({clearTimers:()=>clearInterval(timer),closeWorker:async()=>undefined,closeQueues:async()=>undefined,disconnectDatabase:()=>prisma.$disconnect()});
process.once("SIGINT",()=>{void shutdown().catch(error=>{console.error(`${WORKER_NAME} shutdown failed`,error);process.exitCode=1;});});
process.once("SIGTERM",()=>{void shutdown().catch(error=>{console.error(`${WORKER_NAME} shutdown failed`,error);process.exitCode=1;});});
