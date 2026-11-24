import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.platformSetting.upsert({
    where: { key: 'platform.name' },
    update: {},
    create: { key: 'platform.name', value: 'School Management SaaS' },
  });


  const permissionRows = [
    ["staff.read","staff","read"],["staff.pii.read","staff","pii.read"],["staff.create","staff","create"],["staff.update","staff","update"],["staff.assign","staff","assign"],
    ["students.read","students","read"],["students.create","students","create"],["students.update","students","update"],["students.pii.read","students","pii.read"],
    ["admissions.read","admissions","read"],["admissions.manage","admissions","manage"],
    ["attendance.read","attendance","read"],["attendance.manage","attendance","manage"],
    ["attendance.mark","attendance","mark"],["attendance.correct.request","attendance","correct.request"],["attendance.correct.review","attendance","correct.review"],
    ["hr.read","hr","read"],["hr.manage","hr","manage"],["hr.approve","hr","approve"],["payroll.read","payroll","read"],["payroll.manage","payroll","manage"],["payroll.approve","payroll","approve"],["payroll.pay","payroll","pay"],["health.read","health","read"],["parent.health.read","parent.health","read"],["health.manage","health","manage"],["library.read","library","read"],["library.manage","library","manage"],["transport.read","transport","read"],["transport.manage","transport","manage"],["parent.transport.read","parent.transport","read"],["hostel.read","hostel","read"],["hostel.manage","hostel","manage"],["hostel.safeguarding.read","hostel.safeguarding","read"],["hostel.safeguarding.manage","hostel.safeguarding","manage"],["parent.hostel.read","parent.hostel","read"],["parent.hostel.manage","parent.hostel","manage"],["canteen.read","canteen","read"],["canteen.manage","canteen","manage"],["canteen.serve","canteen","serve"],["parent.canteen.read","parent.canteen","read"],["academics.read","academics","read"],["academics.manage","academics","manage"],["homework.read","homework","read"],["homework.grade","homework","grade"],
    ["fees.read","fees","read"],["fees.manage","fees","manage"],["fees.payments.read","fees.payments","read"],["fees.payments.record","fees.payments","record"], ["fees.refunds.request","fees.refunds","request"], ["fees.refunds.approve","fees.refunds","approve"], ["fees.refunds.settle","fees.refunds","settle"],
    ["communications.read","communications","read"], ["communications.manage","communications","manage"], ["accounting.read","accounting","read"], ["accounting.expenses.read","accounting.expenses","read"], ["accounting.expenses.manage","accounting.expenses","manage"], ["accounting.expenses.approve","accounting.expenses","approve"],["accounting.post","accounting","post"],["accounting.opening-balance.approve","accounting.opening-balance","approve"],["accounting.reconcile","accounting","reconcile"],["accounting.reverse","accounting","reverse"],["accounting.historical-import.approve","accounting.historical-import","approve"],["accounting.historical-operationalize","accounting.historical-import","operationalize"],["accounting.historical-allocation.manage","accounting.historical-allocation","manage"],["accounting.historical-exception.resolve","accounting.historical-exception","resolve"],["accounting.periods.manage","accounting.periods","manage"],
    ["reports.read","reports","read"], ["reports.approve","reports","approve"],["school.settings.manage","school.settings","manage"],
    ["access.roles.manage","access.roles","manage"],["access.assignments.manage","access.assignments","manage"],
    ["parent.portal.read","parent.portal","read"],["parent.attendance.read","parent.attendance","read"],["parent.fees.read","parent.fees","read"],["parent.homework.read","parent.homework","read"],["parent.reports.read","parent.reports","read"],["parent.notifications.read","parent.notifications","read"],["parent.notifications.manage","parent.notifications","manage"],["reports.manage","reports","manage"]
  ];
  for (const [key,module,action] of permissionRows) {
    await prisma.permission.upsert({where:{key},update:{module,action},create:{key,module,action,description:`${action} permission for ${module}`}});
  }
  const roleRows = [
    {key:"SCHOOL_HR",name:"HR Manager",permissions:["staff.read","staff.pii.read","staff.create","staff.update","hr.read","hr.manage","hr.approve","health.read","health.manage","library.read","library.manage","transport.read","transport.manage","hostel.read","hostel.manage","hostel.safeguarding.read","hostel.safeguarding.manage","canteen.read","canteen.manage","canteen.serve","hr.read","hr.manage","hr.approve","payroll.read","payroll.manage","payroll.approve","payroll.pay","access.assignments.manage"]},
    {key:"SCHOOL_PRINCIPAL",name:"Principal",permissions:["staff.read","hr.read","hr.approve","students.read","students.pii.read","admissions.read","attendance.read","attendance.manage","attendance.correct.review","health.read","health.manage","library.read","library.manage","transport.read","transport.manage","hostel.read","hostel.manage","hostel.safeguarding.read","hostel.safeguarding.manage","canteen.read","canteen.manage","canteen.serve","academics.read","reports.read","reports.approve","communications.read","fees.refunds.approve","fees.refunds.settle","communications.read","communications.manage","accounting.expenses.read","accounting.expenses.approve","hr.read","hr.approve","payroll.read","payroll.approve"]},
    {key:"SCHOOL_DEPARTMENT_HEAD",name:"Department Head",permissions:["staff.read","academics.read","attendance.read","students.read","reports.read"]},
    {key:"SCHOOL_TEACHER",name:"Teacher",permissions:["academics.read","homework.read","homework.grade","attendance.read","attendance.mark","attendance.correct.request","students.read","communications.read","communications.manage","canteen.read"]},
    {key:"SCHOOL_FRONT_OFFICE",name:"Front Office",permissions:["students.read","students.create","admissions.read","admissions.manage","staff.read"]},
    {key:"SCHOOL_LIBRARY_STAFF",name:"Librarian",permissions:["library.read","library.manage"]},
    {key:"SCHOOL_TRANSPORT_STAFF",name:"Transport Coordinator",permissions:["transport.read","transport.manage"]},
    {key:"SCHOOL_HOSTEL_STAFF",name:"Hostel Warden",permissions:["hostel.read","hostel.manage","hostel.safeguarding.read","hostel.safeguarding.manage"]},
    {key:"SCHOOL_CANTEEN_STAFF",name:"Canteen Staff",permissions:["canteen.read","canteen.manage","canteen.serve"]},
    {key:"SCHOOL_FINANCE",name:"Finance Officer",permissions:["fees.read","fees.payments.read","fees.payments.record","fees.refunds.request","accounting.read","accounting.post","accounting.reconcile","accounting.historical-import.approve","accounting.historical-operationalize","accounting.historical-allocation.manage","accounting.historical-exception.resolve","accounting.expenses.read","accounting.expenses.manage","accounting.expenses.approve","payroll.read","payroll.manage","payroll.approve","payroll.pay","communications.read","communications.manage"]},
    {key:"PARENT",name:"Parent / Guardian",permissions:["parent.portal.read","parent.attendance.read","parent.fees.read","parent.homework.read","parent.reports.read","parent.health.read","parent.notifications.read","parent.canteen.read","parent.transport.read","parent.hostel.read","parent.hostel.manage","communications.read"]}
  ];
  for (const roleDef of roleRows) {
    const role = await prisma.role.upsert({where:{key:roleDef.key},update:{name:roleDef.name,scopeType:"SCHOOL",isSystem:true},create:{key:roleDef.key,name:roleDef.name,scopeType:"SCHOOL",isSystem:true}});
    const permissions = await prisma.permission.findMany({where:{key:{in:roleDef.permissions}}});
    for (const permission of permissions) {
      await prisma.rolePermission.upsert({where:{roleId_permissionId:{roleId:role.id,permissionId:permission.id}},update:{},create:{roleId:role.id,permissionId:permission.id}});
    }
  }
  // School administrators receive the complete permission catalogue. This also
  // repairs existing SCHOOL_ADMIN role links on every idempotent seed run.
  const schoolAdminRole = await prisma.role.upsert({
    where: { key: "SCHOOL_ADMIN" },
    update: { name: "School Administrator", scopeType: "SCHOOL", isSystem: true },
    create: { key: "SCHOOL_ADMIN", name: "School Administrator", scopeType: "SCHOOL", isSystem: true },
  });
  const allSchoolPermissions = await prisma.permission.findMany();
  for (const permission of allSchoolPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: schoolAdminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: schoolAdminRole.id, permissionId: permission.id },
    });
  }

  const plans = [
    {
      key: "STARTER", name: "Starter", description: "For small schools getting started",
      monthlyPrice: "1999.00", quarterlyPrice: "5697.00", yearlyPrice: "21588.00",
      trialDays: 14, sortOrder: 1,
      entitlements: { staff: true, admissions: true, students: true, attendance: true, fees: true, exams: true, parentPortal: true, teacherApp: true, academicConfiguration: true, curriculumConfiguration: true, advancedReports: false, transport: false, apiAccess: false },
      limits: { students: 500, schools: 1, staff: 50, storageGb: 10 }
    },
    {
      key: "PROFESSIONAL", name: "Professional", description: "For growing schools",
      monthlyPrice: "3999.00", quarterlyPrice: "11397.00", yearlyPrice: "43188.00",
      trialDays: 14, sortOrder: 2,
      entitlements: { staff: true, admissions: true, students: true, attendance: true, fees: true, exams: true, parentPortal: true, teacherApp: true, academicConfiguration: true, curriculumConfiguration: true, advancedReports: true, transport: true, apiAccess: false },
      limits: { students: 2000, schools: 3, staff: 200, storageGb: 50 }
    },
    {
      key: "ENTERPRISE", name: "Enterprise", description: "For large and multi-campus institutions",
      monthlyPrice: "7999.00", quarterlyPrice: "22797.00", yearlyPrice: "86388.00",
      trialDays: 30, sortOrder: 3,
      entitlements: { staff: true, admissions: true, students: true, attendance: true, fees: true, exams: true, parentPortal: true, teacherApp: true, academicConfiguration: true, curriculumConfiguration: true, advancedReports: true, transport: true, apiAccess: true, customBranding: true },
      limits: { students: 10000, schools: 20, staff: 1000, storageGb: 250 }
    }
  ];
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { key: plan.key },
      update: { name: plan.name, description: plan.description, monthlyPrice: plan.monthlyPrice,
        quarterlyPrice: plan.quarterlyPrice, yearlyPrice: plan.yearlyPrice, trialDays: plan.trialDays,
        sortOrder: plan.sortOrder, entitlements: plan.entitlements, limits: plan.limits, isActive: true, isPublic: true },
      create: { ...plan, currency: "INR", isActive: true, isPublic: true }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
