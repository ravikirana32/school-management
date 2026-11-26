import { PrismaClient, ScopeType, MembershipStatus, StudentStatus, StudentEnrollmentStatus, AcademicYearStatus, AttendanceSessionStatus, StudentAttendanceStatus, AttendanceMarkSource, GuardianRelationship, StaffStatus, StaffEmploymentType } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const password = process.env.DEMO_SEED_PASSWORD || 'Demo@School2026!';
const orgSlug = 'demo-green-valley';
const schoolCode = 'GVIS';
const tag = '[P581-DEMO]';

async function main() {
  if (process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Set ALLOW_DEMO_SEED=true to explicitly enable demo seeding.');
  if (password.length < 12) throw new Error('DEMO_SEED_PASSWORD must be at least 12 characters.');
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const org = await prisma.organization.upsert({ where: { slug: orgSlug }, update: { name: 'Green Valley Education Group', isActive: true, lifecycleStatus: 'ACTIVE' }, create: { name: 'Green Valley Education Group', slug: orgSlug, country: 'IN', timezone: 'Asia/Kolkata', isActive: true, lifecycleStatus: 'ACTIVE' } });
  const school = await prisma.school.upsert({ where: { organizationId_code: { organizationId: org.id, code: schoolCode } }, update: { name: 'Green Valley International School', isActive: true, lifecycleStatus: 'ACTIVE' }, create: { organizationId: org.id, name: 'Green Valley International School', code: schoolCode, timezone: 'Asia/Kolkata', isActive: true, lifecycleStatus: 'ACTIVE' } });
  await prisma.schoolProfile.upsert({ where: { schoolId: school.id }, update: { displayName: school.name, boardKey: 'CBSE', city: 'Bengaluru', state: 'Karnataka' }, create: { organizationId: org.id, schoolId: school.id, displayName: school.name, legalName: school.name, schoolType: 'CO_EDUCATIONAL', boardKey: 'CBSE', addressLine1: 'Demo Campus, Education Road', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', countryCode: 'IN', phone: '+918000000001', email: 'office@greenvalley.demo' } });

  const roleDefs = [
    ['PLATFORM_ADMIN','Platform Administrator',ScopeType.PLATFORM], ['ORG_ADMIN','Organization Administrator',ScopeType.ORGANIZATION],
    ['SCHOOL_ADMIN','School Administrator',ScopeType.SCHOOL], ['TEACHER','Teacher (API role alias)',ScopeType.SCHOOL], ['ACCOUNTANT','Accountant (API role alias)',ScopeType.SCHOOL], ['SCHOOL_PRINCIPAL','Principal',ScopeType.SCHOOL], ['SCHOOL_TEACHER','Teacher',ScopeType.SCHOOL],
    ['SCHOOL_FRONT_OFFICE','Front Office',ScopeType.SCHOOL], ['SCHOOL_FINANCE','Finance Officer',ScopeType.SCHOOL], ['SCHOOL_HR','HR Manager',ScopeType.SCHOOL],
    ['SCHOOL_LIBRARY_STAFF','Librarian',ScopeType.SCHOOL], ['SCHOOL_TRANSPORT_STAFF','Transport Coordinator',ScopeType.SCHOOL],
    ['SCHOOL_HOSTEL_STAFF','Hostel Warden',ScopeType.SCHOOL], ['SCHOOL_CANTEEN_STAFF','Canteen Staff',ScopeType.SCHOOL],
    ['SCHOOL_DEPARTMENT_HEAD','Department Head',ScopeType.SCHOOL], ['PARENT','Parent / Guardian',ScopeType.SCHOOL]
  ] as const;
  const roles = new Map<string,string>();
  for (const [key,name,scopeType] of roleDefs) {
    const r = await prisma.role.upsert({ where: { key }, update: { name,scopeType,isSystem:true }, create: { key,name,scopeType,isSystem:true } });
    roles.set(key,r.id);
  }
  const orgAdminRoleId = roles.get('ORG_ADMIN')!;
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) await prisma.rolePermission.upsert({ where:{roleId_permissionId:{roleId:orgAdminRoleId,permissionId:permission.id}}, update:{}, create:{roleId:orgAdminRoleId,permissionId:permission.id} });
  for (const [alias,source] of [['TEACHER','SCHOOL_TEACHER'],['ACCOUNTANT','SCHOOL_FINANCE']] as const) { const sourceLinks=await prisma.rolePermission.findMany({where:{roleId:roles.get(source)!}}); for (const link of sourceLinks) await prisma.rolePermission.upsert({where:{roleId_permissionId:{roleId:roles.get(alias)!,permissionId:link.permissionId}},update:{},create:{roleId:roles.get(alias)!,permissionId:link.permissionId}}); }
  const accounts = [
    ['superadmin@school.demo','Demo Super Admin','PLATFORM_ADMIN'], ['orgadmin@school.demo','Demo Organization Admin','ORG_ADMIN'],
    ['schooladmin@school.demo','Demo School Admin','SCHOOL_ADMIN'], ['principal@school.demo','Demo Principal','SCHOOL_PRINCIPAL'],
    ['teacher@school.demo','Demo Teacher','SCHOOL_TEACHER'], ['frontoffice@school.demo','Demo Front Office','SCHOOL_FRONT_OFFICE'],
    ['finance@school.demo','Demo Finance Officer','SCHOOL_FINANCE'], ['hr@school.demo','Demo HR Manager','SCHOOL_HR'],
    ['librarian@school.demo','Demo Librarian','SCHOOL_LIBRARY_STAFF'], ['transport@school.demo','Demo Transport Coordinator','SCHOOL_TRANSPORT_STAFF'],
    ['warden@school.demo','Demo Hostel Warden','SCHOOL_HOSTEL_STAFF'], ['canteen@school.demo','Demo Canteen Staff','SCHOOL_CANTEEN_STAFF'],
    ['hod@school.demo','Demo Department Head','SCHOOL_DEPARTMENT_HEAD'], ['parent@school.demo','Demo Parent','PARENT']
  ] as const;
  const userIds = new Map<string,string>();
  for (const [email,displayName,roleKey] of accounts) {
    const user = await prisma.user.upsert({ where: { email }, update: { displayName,passwordHash,isActive:true,isPlatformAdmin:roleKey==='PLATFORM_ADMIN',emailVerifiedAt:new Date() }, create: { email,displayName,passwordHash,isActive:true,isPlatformAdmin:roleKey==='PLATFORM_ADMIN',emailVerifiedAt:new Date() } });
    userIds.set(roleKey,user.id);
    if (roleKey !== 'PLATFORM_ADMIN') {
      await prisma.organizationMembership.upsert({ where: { userId_organizationId: { userId:user.id,organizationId:org.id } }, update: { status:MembershipStatus.ACTIVE,joinedAt:new Date() }, create: { userId:user.id,organizationId:org.id,status:MembershipStatus.ACTIVE,joinedAt:new Date() } });
      await prisma.schoolMembership.upsert({ where: { userId_schoolId: { userId:user.id,schoolId:school.id } }, update: { organizationId:org.id,status:MembershipStatus.ACTIVE,joinedAt:new Date() }, create: { userId:user.id,organizationId:org.id,schoolId:school.id,status:MembershipStatus.ACTIVE,joinedAt:new Date() } });
    }
    const roleId = roles.get(roleKey)!;
    const existing = await prisma.userRoleAssignment.findFirst({ where: { userId:user.id,roleId,organizationId:roleKey==='PLATFORM_ADMIN'?null:org.id,schoolId:roleKey==='ORG_ADMIN'||roleKey==='PLATFORM_ADMIN'?null:school.id,scopeType:roleKey==='PLATFORM_ADMIN'?ScopeType.PLATFORM:roleKey==='ORG_ADMIN'?ScopeType.ORGANIZATION:ScopeType.SCHOOL } });
    if (!existing) await prisma.userRoleAssignment.create({ data: { userId:user.id,roleId,scopeType:roleKey==='PLATFORM_ADMIN'?ScopeType.PLATFORM:roleKey==='ORG_ADMIN'?ScopeType.ORGANIZATION:ScopeType.SCHOOL,organizationId:roleKey==='PLATFORM_ADMIN'?null:org.id,schoolId:roleKey==='ORG_ADMIN'||roleKey==='PLATFORM_ADMIN'?null:school.id,assignedBy:userIds.get('PLATFORM_ADMIN')??user.id } });
    const aliasKey=roleKey==='SCHOOL_TEACHER'?'TEACHER':roleKey==='SCHOOL_FINANCE'?'ACCOUNTANT':null;
    if(aliasKey){const aliasRoleId=roles.get(aliasKey)!;const aliasExisting=await prisma.userRoleAssignment.findFirst({where:{userId:user.id,roleId:aliasRoleId,organizationId:org.id,schoolId:school.id,scopeType:ScopeType.SCHOOL}});if(!aliasExisting) await prisma.userRoleAssignment.create({data:{userId:user.id,roleId:aliasRoleId,scopeType:ScopeType.SCHOOL,organizationId:org.id,schoolId:school.id,assignedBy:userIds.get('PLATFORM_ADMIN')??user.id}});}
  }
  const actorId = userIds.get('SCHOOL_ADMIN')!;
  const year = await prisma.academicYear.upsert({ where: { schoolId_code: { schoolId:school.id,code:'2026-27' } }, update: { name:'Academic Year 2026–27',status:AcademicYearStatus.ACTIVE,isCurrent:true }, create: { organizationId:org.id,schoolId:school.id,name:'Academic Year 2026–27',code:'2026-27',startsOn:new Date('2026-04-01'),endsOn:new Date('2027-03-31'),status:AcademicYearStatus.ACTIVE,isCurrent:true,createdBy:actorId } });
  const grades = [];
  for (let n=1;n<=12;n++) { const code=`G${String(n).padStart(2,'0')}`; grades.push(await prisma.gradeLevel.upsert({ where:{schoolId_code:{schoolId:school.id,code}},update:{name:`Grade ${n}`,sequence:n,isActive:true},create:{organizationId:org.id,schoolId:school.id,code,name:`Grade ${n}`,sequence:n,stage:n<=5?'PRIMARY':n<=8?'MIDDLE':'SECONDARY',ageMin:n+4,ageMax:n+5,isActive:true} })); }
  const departments=[];
  for (const [code,name] of [['ACA','Academics'],['ADM','Administration'],['FIN','Finance'],['OPS','Operations'],['LIB','Library'],['TRN','Transport']] as const) departments.push(await prisma.staffDepartment.upsert({where:{schoolId_code:{schoolId:school.id,code}},update:{name,isActive:true},create:{organizationId:org.id,schoolId:school.id,code,name,isActive:true}}));
  const designations=[];
  for (const [code,name,isTeachingRole] of [['TCH','Teacher',true],['HOD','Head of Department',true],['ADM','Administrator',false],['FIN','Accountant',false],['LIB','Librarian',false],['OPS','Operations Officer',false]] as const) designations.push(await prisma.staffDesignation.upsert({where:{schoolId_code:{schoolId:school.id,code}},update:{name,isTeachingRole,isActive:true},create:{organizationId:org.id,schoolId:school.id,code,name,isTeachingRole,isActive:true}}));
  for (let i=1;i<=20;i++) {
    const email=i===1?'teacher@school.demo':`teacher${String(i).padStart(2,'0')}@greenvalley.demo`;
    const user=i===1?{id:userIds.get('SCHOOL_TEACHER')!}:await prisma.user.upsert({where:{email},update:{displayName:`Teacher ${i}`,passwordHash,isActive:true},create:{email,displayName:`Teacher ${i}`,passwordHash,isActive:true}});
    await prisma.staffMember.upsert({where:{schoolId_employeeNumber:{schoolId:school.id,employeeNumber:`GV-T-${String(i).padStart(3,'0')}`}},update:{firstName:`Teacher${i}`,lastName:'Demo',email,status:StaffStatus.ACTIVE,userId:user.id},create:{organizationId:org.id,schoolId:school.id,employeeNumber:`GV-T-${String(i).padStart(3,'0')}`,firstName:`Teacher${i}`,lastName:'Demo',email,phone:`+91990000${String(i).padStart(4,'0')}`,departmentId:departments[0].id,designationId:designations[i%designations.length].id,employmentType:StaffEmploymentType.FULL_TIME,status:StaffStatus.ACTIVE,dateOfJoining:new Date('2022-06-01'),userId:user.id,createdBy:actorId}});
  }
  // Give the primary teacher account class assignments across every grade for teacher workspace demos.
  const primaryTeacher = await prisma.staffMember.findUnique({where:{schoolId_employeeNumber:{schoolId:school.id,employeeNumber:'GV-T-001'}}});
  if (primaryTeacher) for (const grade of grades) {
    const assignment = await prisma.teacherAssignment.findFirst({where:{staffMemberId:primaryTeacher.id,academicYearId:year.id,gradeLevelId:grade.id,sectionName:'A',curriculumSubjectId:null}});
    if (!assignment) await prisma.teacherAssignment.create({data:{organizationId:org.id,schoolId:school.id,staffMemberId:primaryTeacher.id,academicYearId:year.id,gradeLevelId:grade.id,sectionName:'A',curriculumSubjectId:null,isClassTeacher:grade.sequence===1,startsOn:new Date('2026-04-01'),isActive:true,createdBy:actorId}});
  }

  const firstNames=['Aarav','Aadhya','Vihaan','Ananya','Ishaan','Diya','Advait','Saanvi','Arjun','Myra','Kabir','Ira','Reyansh','Anika','Rohan','Kiara','Dev','Meera','Aditya','Tara'];
  const surnames=['Sharma','Reddy','Iyer','Nair','Patil','Rao','Kulkarni','Shetty','Joshi','Menon'];
  const students=[];
  for (let i=1;i<=60;i++) {
    const grade=grades[(i-1)%grades.length], first=firstNames[(i-1)%firstNames.length], last=surnames[(i-1)%surnames.length];
    const student=await prisma.student.upsert({where:{schoolId_admissionNumber:{schoolId:school.id,admissionNumber:`GV2026${String(i).padStart(3,'0')}`}},update:{firstName:first,lastName:last,status:StudentStatus.ACTIVE,notes:`${tag} Sample student ${i}`},create:{organizationId:org.id,schoolId:school.id,admissionNumber:`GV2026${String(i).padStart(3,'0')}`,firstName:first,lastName:last,dateOfBirth:new Date(2015+((i-1)%8),i%12,1+(i%27)),gender:i%2?'MALE':'FEMALE',nationality:'Indian',primaryLanguage:i%3?'English':'Kannada',email:`student${i}@student.greenvalley.demo`,phone:`+91980000${String(i).padStart(4,'0')}`,city:'Bengaluru',state:'Karnataka',countryCode:'IN',status:StudentStatus.ACTIVE,admissionDate:new Date('2026-04-01'),notes:`${tag} Sample student ${i}`,createdBy:actorId}});
    students.push(student);
    const phone=`+91870000${String(i).padStart(4,'0')}`;
    const guardian=await prisma.guardian.findFirst({where:{organizationId:org.id,schoolId:school.id,phone}})??await prisma.guardian.create({data:{organizationId:org.id,schoolId:school.id,firstName:`${first} Parent`,lastName:last,email:`parent${i}@greenvalley.demo`,phone,occupation:['Engineer','Teacher','Doctor','Business','Accountant'][i%5],address:'Bengaluru, Karnataka',isActive:true}});
    await prisma.studentGuardian.upsert({where:{studentId_guardianId:{studentId:student.id,guardianId:guardian.id}},update:{isPrimary:true,isEmergency:true,canPickup:true},create:{organizationId:org.id,schoolId:school.id,studentId:student.id,guardianId:guardian.id,relationship:i%2?GuardianRelationship.FATHER:GuardianRelationship.MOTHER,isPrimary:true,isEmergency:true,canPickup:true,canReceiveCommunications:true}});
    if (i===1) await prisma.guardian.update({where:{id:guardian.id},data:{userId:userIds.get('PARENT')}});
    await prisma.studentEnrollment.upsert({where:{studentId_academicYearId:{studentId:student.id,academicYearId:year.id}},update:{gradeLevelId:grade.id,sectionName:['A','B','C'][i%3],rollNumber:String(i),status:StudentEnrollmentStatus.ENROLLED},create:{organizationId:org.id,schoolId:school.id,studentId:student.id,academicYearId:year.id,gradeLevelId:grade.id,sectionName:['A','B','C'][i%3],rollNumber:String(i),status:StudentEnrollmentStatus.ENROLLED,enrolledOn:new Date('2026-04-01'),createdBy:actorId}});
  }
  for (let day=0;day<5;day++) {
    const sessionDate=new Date(2026,10,16+day);
    for (let gradeIndex=0;gradeIndex<grades.length;gradeIndex++) {
      const grade=grades[gradeIndex];
      const session=await prisma.attendanceSession.upsert({where:{organizationId_schoolId_academicYearId_gradeLevelId_sectionName_sessionDate:{organizationId:org.id,schoolId:school.id,academicYearId:year.id,gradeLevelId:grade.id,sectionName:'A',sessionDate}},update:{status:AttendanceSessionStatus.SUBMITTED,updatedBy:actorId},create:{organizationId:org.id,schoolId:school.id,academicYearId:year.id,gradeLevelId:grade.id,sectionName:'A',sessionDate,status:AttendanceSessionStatus.SUBMITTED,submittedAt:new Date(),createdBy:actorId,updatedBy:actorId}});
      for (let i=gradeIndex;i<students.length;i+=grades.length) {
        const student=students[i], enrollment=await prisma.studentEnrollment.findUnique({where:{studentId_academicYearId:{studentId:student.id,academicYearId:year.id}}});
        const status=i%17===0?StudentAttendanceStatus.ABSENT:i%13===0?StudentAttendanceStatus.LATE:StudentAttendanceStatus.PRESENT;
        await prisma.studentAttendance.upsert({where:{sessionId_studentId:{sessionId:session.id,studentId:student.id}},update:{status,markedBy:userIds.get('SCHOOL_TEACHER')!,source:AttendanceMarkSource.TEACHER},create:{organizationId:org.id,schoolId:school.id,sessionId:session.id,studentId:student.id,enrollmentId:enrollment?.id,status,markedBy:userIds.get('SCHOOL_TEACHER')!,source:AttendanceMarkSource.TEACHER}});
      }
    }
  }
  for (let i=0;i<60;i++) { const student=students[i],grade=grades[i%grades.length],chargeCode=`DEMO-TUITION-2026-${String(i+1).padStart(3,'0')}`; await prisma.studentFeeCharge.upsert({where:{schoolId_studentId_chargeCode:{schoolId:school.id,studentId:student.id,chargeCode}},update:{title:'Annual tuition fee (demo)',status:'PUBLISHED',approvalStatus:'APPROVED',publishedAt:new Date('2026-04-01')},create:{organizationId:org.id,schoolId:school.id,studentId:student.id,chargeCode,title:'Annual tuition fee (demo)',description:`${tag} Demo only; no real payment due.`,category:'TUITION',currency:'INR',amount:'24000.00',amountPaid:'0.00',dueAt:new Date('2026-12-15'),status:'PUBLISHED',approvalStatus:'APPROVED',gradeLevelId:grade.id,publishedAt:new Date('2026-04-01'),createdBy:actorId}}); }
  // Immutable fee invoice snapshots, with no payment transactions or gateway activity.
  for (let i=0;i<60;i++) {
    const student=students[i], chargeCode=`DEMO-TUITION-2026-${String(i+1).padStart(3,'0')}`;
    const charge=await prisma.studentFeeCharge.findUnique({where:{schoolId_studentId_chargeCode:{schoolId:school.id,studentId:student.id,chargeCode}}});
    if (!charge) continue;
    const invoice=await prisma.schoolFeeInvoice.upsert({where:{chargeId_organizationId_schoolId:{chargeId:charge.id,organizationId:org.id,schoolId:school.id}},update:{status:'ISSUED',amountDue:'24000.00'},create:{organizationId:org.id,schoolId:school.id,studentId:student.id,chargeId:charge.id,invoiceNumber:`GV-INV-2026-${String(i+1).padStart(4,'0')}`,status:'ISSUED',currency:'INR',subtotal:'24000.00',concessionTotal:'0.00',total:'24000.00',amountDue:'24000.00',issuedAt:new Date('2026-04-01'),dueAt:new Date('2026-12-15'),billingSnapshot:{demo:true,description:'Annual tuition fee',studentAdmissionNumber:student.admissionNumber},createdBy:actorId}});
    const line=await prisma.schoolFeeInvoiceLine.findFirst({where:{invoiceId:invoice.id,lineNumber:1}});
    if (!line) await prisma.schoolFeeInvoiceLine.create({data:{organizationId:org.id,schoolId:school.id,invoiceId:invoice.id,lineNumber:1,description:'Annual tuition fee (demo)',quantity:'1.00',grossAmount:'24000.00',concessionAmount:'0.00',netAmount:'24000.00',dueAt:new Date('2026-12-15')}});
  }

  // More page-ready operational records: exams, homework, calendar, expenses and notices.
  const calendar = await prisma.schoolCalendar.findFirst({where:{organizationId:org.id,schoolId:school.id,name:'Demo Academic Calendar'}}) ?? await prisma.schoolCalendar.create({data:{organizationId:org.id,schoolId:school.id,name:'Demo Academic Calendar',academicYearId:year.id,isDefault:true}});
  for (let i=1;i<=60;i++) {
    const grade=grades[(i-1)%grades.length], student=students[i-1], examDate=new Date(2026,10,20+(i%8));
    const examName=['Unit Test 1','Mid Term','Unit Test 2','Term Assessment'][i%4];
    const examSubject=['Mathematics','Science','English','Social Studies','Kannada'][i%5];
    const existingExam=await prisma.schoolAssessmentExam.findFirst({where:{organizationId:org.id,schoolId:school.id,academicYearId:year.id,gradeLevelId:grade.id,examName,subjectName:examSubject}});
    const examData={organizationId:org.id,schoolId:school.id,academicYearId:year.id,gradeLevelId:grade.id,sectionName:'A',subjectName:examSubject,examName,examDate,maxMarks:'100.00',passMarks:'35.00',marks:[],status:'PUBLISHED',createdBy:actorId};
    if (existingExam) await prisma.schoolAssessmentExam.update({where:{id:existingExam.id},data:examData}); else await prisma.schoolAssessmentExam.create({data:examData});
    const homeworkTitle=`${examSubject} Practice ${String(i).padStart(2,'0')}`;
    const oldHomework=await prisma.homeworkAssignment.findFirst({where:{organizationId:org.id,schoolId:school.id,studentId:student.id,title:homeworkTitle}});
    const homeworkData={organizationId:org.id,schoolId:school.id,studentId:student.id,title:homeworkTitle,subjectName:examSubject,description:`${tag} Complete the assigned practice questions and submit for teacher review.`,dueAt:new Date(2026,11,20+(i%8)),status:'PUBLISHED',approvalStatus:'APPROVED',gradeLevelId:grade.id,publishedAt:new Date('2026-11-01'),createdBy:actorId};
    if (oldHomework) await prisma.homeworkAssignment.update({where:{id:oldHomework.id},data:homeworkData}); else await prisma.homeworkAssignment.create({data:homeworkData});
  }
  for (let i=1;i<=20;i++) {
    const startsAt=new Date(2026,11,(i%28)+1,9,0), eventType=i%4===0?'PARENT_MEETING':i%4===1?'SCHOOL_EVENT':i%4===2?'EXAM':'STAFF_EVENT';
    const title=`Demo School Event ${String(i).padStart(2,'0')}`;
    const old=await prisma.calendarEvent.findFirst({where:{organizationId:org.id,schoolId:school.id,calendarId:calendar.id,title}});
    const data={organizationId:org.id,schoolId:school.id,calendarId:calendar.id,title,description:`${tag} Sample calendar event`,eventType:eventType as any,audience:'ALL' as any,startsAt,endsAt:new Date(startsAt.getTime()+60*60*1000),isAllDay:false,location:'Main Campus',createdBy:actorId};
    if(old) await prisma.calendarEvent.update({where:{id:old.id},data}); else await prisma.calendarEvent.create({data});
  }
  for(let i=1;i<=30;i++) {
    const expenseNumber=`DEMO-EXP-${String(i).padStart(4,'0')}`;
    await prisma.schoolExpense.upsert({where:{schoolId_expenseNumber:{schoolId:school.id,expenseNumber}},update:{title:`Campus operating expense ${i}`,status:'APPROVED'},create:{organizationId:org.id,schoolId:school.id,expenseNumber,title:`Campus operating expense ${i}`,category:['UTILITIES','SUPPLIES','MAINTENANCE','TRANSPORT'][i%4],vendorName:['ABC Supplies','City Utilities','Campus Services'][i%3],description:`${tag} Sample expense; not a real payable.`,currency:'INR',amount:String(1500+i*125),expenseDate:new Date(2026,10,(i%28)+1),status:'APPROVED',submittedAt:new Date(),approvedAt:new Date(),approvedBy:userIds.get('SCHOOL_PRINCIPAL')!,createdBy:userIds.get('SCHOOL_FINANCE')!}});
  }
  for(let i=1;i<=30;i++) {
    const title=`Demo School Notice ${String(i).padStart(2,'0')}`;
    const old=await prisma.schoolCommunication.findFirst({where:{organizationId:org.id,schoolId:school.id,title}});
    const data={organizationId:org.id,schoolId:school.id,title,body:`${tag} This is sample communication ${i} for demonstrating school announcements and communication list views.`,audience:'ALL',targetAcademicYearId:year.id,priority:i%5===0?'HIGH':'NORMAL',status:'PUBLISHED',createdBy:actorId,publishedBy:userIds.get('SCHOOL_PRINCIPAL')!,publishedAt:new Date()};
    if(old) await prisma.schoolCommunication.update({where:{id:old.id},data}); else await prisma.schoolCommunication.create({data});
  }
  await prisma.platformSetting.upsert({where:{key:'demo.seed.version'},update:{value:'P581-v1'},create:{key:'demo.seed.version',value:'P581-v1'}});
  console.log(JSON.stringify({status:'SUCCESS',organization:orgSlug,school:schoolCode,password:'Set by DEMO_SEED_PASSWORD or documented local default',accounts:accounts.map(([email,displayName,role])=>({email,displayName,role})),counts:{students:await prisma.student.count({where:{organizationId:org.id,schoolId:school.id}}),guardians:await prisma.guardian.count({where:{organizationId:org.id,schoolId:school.id}}),enrollments:await prisma.studentEnrollment.count({where:{organizationId:org.id,schoolId:school.id}}),staff:await prisma.staffMember.count({where:{organizationId:org.id,schoolId:school.id}}),attendanceSessions:await prisma.attendanceSession.count({where:{organizationId:org.id,schoolId:school.id}}),attendanceRows:await prisma.studentAttendance.count({where:{organizationId:org.id,schoolId:school.id}}),feeCharges:await prisma.studentFeeCharge.count({where:{organizationId:org.id,schoolId:school.id}}),feeInvoices:await prisma.schoolFeeInvoice.count({where:{organizationId:org.id,schoolId:school.id}}),teacherAssignments:await prisma.teacherAssignment.count({where:{organizationId:org.id,schoolId:school.id}}),exams:await prisma.schoolAssessmentExam.count({where:{organizationId:org.id,schoolId:school.id}}),homework:await prisma.homeworkAssignment.count({where:{organizationId:org.id,schoolId:school.id}}),calendarEvents:await prisma.calendarEvent.count({where:{organizationId:org.id,schoolId:school.id}}),expenses:await prisma.schoolExpense.count({where:{organizationId:org.id,schoolId:school.id}}),communications:await prisma.schoolCommunication.count({where:{organizationId:org.id,schoolId:school.id}})}},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>prisma.$disconnect());
