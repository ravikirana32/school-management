import { randomUUID } from "node:crypto";

/**
 * Queue privacy-scoped hostel leave notifications.
 * IN_APP is persisted immediately. EMAIL is handed to the existing notification
 * outbox/worker; this helper never claims provider delivery.
 */
export async function notifyHostelLeaveGuardians(tx:any,input:{
 organizationId:string;schoolId:string;leaveRequestId:string;studentId:string;
 eventType:string;title:string;body:string;createdBy:string;
}) {
 const links=await tx.studentGuardian.findMany({
  where:{organizationId:input.organizationId,schoolId:input.schoolId,studentId:input.studentId,canReceiveCommunications:true,
   guardian:{isActive:true,userId:{not:null},emailVerifiedAt:{not:null}}},
  select:{guardianId:true,guardian:{select:{id:true,userId:true,email:true,emailVerifiedAt:true}}}
 });
 if(!links.length)return {guardians:0,inAppQueued:0,emailQueued:0,skipped:0};
 const guardianIds=[...new Set(links.map((x:any)=>x.guardianId))];
 const invitations=await tx.parentInvitation.findMany({
  where:{organizationId:input.organizationId,schoolId:input.schoolId,guardianId:{in:guardianIds},status:"ACCEPTED",consentAcceptedAt:{not:null},consentWithdrawnAt:null},
  select:{guardianId:true,acceptedByUserId:true}
 });
 const accepted=new Set(invitations.map((x:any)=>`${x.guardianId}:${x.acceptedByUserId}`));
 let inAppQueued=0,emailQueued=0,skipped=0;
 const now=new Date();
 for(const link of links){
  const guardian=link.guardian;
  const userId=guardian?.userId;
  if(!guardian||!userId||!accepted.has(`${guardian.id}:${userId}`))continue;
  const consent=await tx.hostelGuardianConsent.findUnique({
   where:{organizationId_schoolId_studentId_guardianId:{organizationId:input.organizationId,schoolId:input.schoolId,studentId:input.studentId,guardianId:guardian.id}}
  });
  if(!consent||!consent.leaveUpdatesEnabled||consent.revokedAt){
   const eventKey=`hostel-leave:${input.leaveRequestId}:${eventId}:${guardian.id}:NONE`;
   await tx.hostelLeaveNotificationEvent.upsert({
    where:{eventKey},
    create:{id:randomUUID(),eventKey,organizationId:input.organizationId,schoolId:input.schoolId,leaveRequestId:input.leaveRequestId,studentId:input.studentId,guardianId:guardian.id,recipientUserId:userId,eventType:input.eventType,channel:"NONE",status:"SKIPPED_NO_CONSENT"},
    update:{status:"SKIPPED_NO_CONSENT",lastError:null}
   });
   skipped++;continue;
  }
  let deliveredInApp=false;
  if(consent.inAppEnabled){
   const pref=await tx.notificationPreference.findFirst({where:{organizationId:input.organizationId,schoolId:input.schoolId,userId,category:"HOSTEL_LEAVE",channel:"IN_APP",enabled:false},select:{id:true}});
   if(!pref){
    const id=`hostel-leave:${input.leaveRequestId}:${eventId}:${guardian.id}:IN_APP`;
    await tx.parentNotification.createMany({data:[{id,organizationId:input.organizationId,schoolId:input.schoolId,recipientUserId:userId,studentId:input.studentId,category:"HOSTEL_LEAVE",title:input.title,body:input.body,createdBy:input.createdBy}],skipDuplicates:true});
    const eventKey=`hostel-leave:${input.leaveRequestId}:${eventId}:${guardian.id}:IN_APP`;
    await tx.hostelLeaveNotificationEvent.upsert({
     where:{eventKey},
     create:{id:randomUUID(),eventKey,organizationId:input.organizationId,schoolId:input.schoolId,leaveRequestId:input.leaveRequestId,studentId:input.studentId,guardianId:guardian.id,recipientUserId:userId,eventType:input.eventType,channel:"IN_APP",status:"DELIVERED",deliveredAt:now},
     update:{status:"DELIVERED",deliveredAt:now,lastError:null}
    });
    inAppQueued++;deliveredInApp=true;
   }
  }
  let deliveredEmail=false;
  if(consent.emailEnabled&&guardian.email&&guardian.emailVerifiedAt){
   const pref=await tx.notificationPreference.findFirst({where:{organizationId:input.organizationId,schoolId:input.schoolId,userId,category:"HOSTEL_LEAVE",channel:"EMAIL",enabled:false},select:{id:true}});
   if(!pref){
    const batchId=`hostel-leave:${input.leaveRequestId}:${eventId}`;
    await tx.notificationBatch.upsert({
     where:{id:batchId},
     create:{id:batchId,organizationId:input.organizationId,schoolId:input.schoolId,category:"HOSTEL_LEAVE",title:input.title,createdBy:input.createdBy,recipientCount:links.length},
     update:{}
    });
    const outboxId=`${batchId}:${userId}:EMAIL`;
    await tx.notificationOutbox.createMany({data:[{
     id:outboxId,organizationId:input.organizationId,schoolId:input.schoolId,batchId,recipientUserId:userId,studentId:input.studentId,
     category:"HOSTEL_LEAVE",channel:"EMAIL",status:"PENDING",payload:{title:input.title,body:input.body,leaveRequestId:input.leaveRequestId,eventType:input.eventType},attempts:0
    }],skipDuplicates:true});
    const eventKey=`hostel-leave:${input.leaveRequestId}:${eventId}:${guardian.id}:EMAIL`;
    await tx.hostelLeaveNotificationEvent.upsert({
     where:{eventKey},
     create:{id:randomUUID(),eventKey,organizationId:input.organizationId,schoolId:input.schoolId,leaveRequestId:input.leaveRequestId,studentId:input.studentId,guardianId:guardian.id,recipientUserId:userId,eventType:input.eventType,channel:"EMAIL",status:"QUEUED",notificationOutboxId:outboxId},
     update:{status:"QUEUED",notificationOutboxId:outboxId,lastError:null}
    });
    emailQueued++;deliveredEmail=true;
   }
  }
  if(!deliveredInApp&&!deliveredEmail){
   const eventKey=`hostel-leave:${input.leaveRequestId}:${eventId}:${guardian.id}:NONE`;
   await tx.hostelLeaveNotificationEvent.upsert({
    where:{eventKey},
    create:{id:randomUUID(),eventKey,organizationId:input.organizationId,schoolId:input.schoolId,leaveRequestId:input.leaveRequestId,studentId:input.studentId,guardianId:guardian.id,recipientUserId:userId,eventType:input.eventType,channel:"NONE",status:"SKIPPED_PREFERENCE"},
    update:{status:"SKIPPED_PREFERENCE"}
   });
   skipped++;
  }
 }
 return {guardians:links.length,inAppQueued,emailQueued,skipped};
}
