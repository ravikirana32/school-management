import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { authenticate } from "../auth/auth.middleware.js";
import { withTenantContext } from "../auth/tenant-context.js";
import { hasSchoolPermission } from "../auth/school-permissions.js";
import { hasActiveSchoolMembership } from "../schools/school-config.authorization.js";

export const journeyRouter = Router();
journeyRouter.use(authenticate);
const wrap = (fn: (req:any,res:any)=>Promise<any>) =>
  (req:any,res:any,next:any) => Promise.resolve(fn(req,res)).catch(next);

journeyRouter.get("/:organizationId/:schoolId/journeys/overview", wrap(async (req,res) => {
  const organizationId = String(req.params.organizationId || "");
  const schoolId = String(req.params.schoolId || "");
  const userId = req.auth!.userId;

  if (!await hasActiveSchoolMembership(userId, organizationId, schoolId)) {
    return res.status(403).json({ error: "Active school membership required" });
  }
  if (!await hasSchoolPermission(userId, organizationId, schoolId, "reports.read")) {
    return res.status(403).json({ error: "Missing required permission: reports.read" });
  }

  const data = await withTenantContext(prisma, { organizationId, schoolId, userId }, async (tx:any) => {
    const [
      applications, convertedApplications, enrolledStudents,
      attendanceSessions, submittedAttendanceSessions, attendanceMarks,
      reportCards, publishedReportCards,
      feeCharges, feePayments, feeTotals, paymentTotals,
      activeStaff, employmentRecords, teacherAssignments,
      guardians, linkedGuardians, acceptedInvitations, pendingInvitations, parentNotifications
    ] = await Promise.all([
      tx.admissionApplication.count({ where:{ organizationId, schoolId } }),
      tx.admissionApplication.count({ where:{ organizationId, schoolId, status:"CONVERTED" } }),
      tx.studentEnrollment.count({ where:{ organizationId, schoolId, status:"ENROLLED" } }),
      tx.attendanceSession.count({ where:{ organizationId, schoolId } }),
      tx.attendanceSession.count({ where:{ organizationId, schoolId, status:{ in:["SUBMITTED","LOCKED"] } } }),
      tx.studentAttendance.count({ where:{ organizationId, schoolId } }),
      tx.studentReportCard.count({ where:{ organizationId, schoolId } }),
      tx.studentReportCard.count({ where:{ organizationId, schoolId, publishedAt:{ not:null } } }),
      tx.studentFeeCharge.count({ where:{ organizationId, schoolId } }),
      tx.studentFeePayment.count({ where:{ organizationId, schoolId, status:{ in:["RECORDED","CONFIRMED","SUCCEEDED"] } } }),
      tx.studentFeeCharge.aggregate({ where:{ organizationId, schoolId }, _sum:{ amount:true, amountPaid:true } }),
      tx.studentFeePayment.aggregate({ where:{ organizationId, schoolId, status:{ in:["RECORDED","CONFIRMED","SUCCEEDED"] } }, _sum:{ amount:true } }),
      tx.staffMember.count({ where:{ organizationId, schoolId, status:"ACTIVE" } }),
      tx.staffEmploymentHistory.count({ where:{ organizationId, schoolId } }),
      tx.teacherAssignment.count({ where:{ organizationId, schoolId, isActive:true } }),
      tx.guardian.count({ where:{ organizationId, schoolId, isActive:true } }),
      tx.guardian.count({ where:{ organizationId, schoolId, isActive:true, userId:{ not:null } } }),
      tx.parentInvitation.count({ where:{ organizationId, schoolId, status:"ACCEPTED", consentWithdrawnAt:null } }),
      tx.parentInvitation.count({ where:{ organizationId, schoolId, status:"PENDING" } }),
      tx.parentNotification.count({ where:{ organizationId, schoolId } })
    ]);

    const billed = Number(feeTotals?._sum?.amount || 0);
    const chargePaid = Number(feeTotals?._sum?.amountPaid || 0);
    const paymentRecorded = Number(paymentTotals?._sum?.amount || 0);
    const outstanding = Math.max(0, billed - chargePaid);
    return {
      generatedAt: new Date().toISOString(),
      scope: { organizationId, schoolId },
      journeys: {
        admissionToEnrollment: {
          title:"Admission → Enrollment",
          state: convertedApplications > 0 && enrolledStudents > 0 ? "ACTIVE" : "NEEDS_ATTENTION",
          metrics:{ applications, convertedApplications, enrolledStudents, awaitingConversion:Math.max(0,applications-convertedApplications) },
          nextAction: applications > convertedApplications ? "Review accepted applications and complete student conversion." : "Continue the student enrollment and class-allocation workflow."
        },
        attendanceToReportCard: {
          title:"Attendance → Report card",
          state: attendanceSessions > 0 && publishedReportCards > 0 ? "ACTIVE" : "NEEDS_ATTENTION",
          metrics:{ attendanceSessions, submittedAttendanceSessions, attendanceMarks, reportCards, publishedReportCards },
          nextAction: submittedAttendanceSessions < attendanceSessions ? "Submit or lock outstanding attendance sessions." : publishedReportCards < reportCards ? "Complete report-card approval and publication." : "Continue the next academic reporting cycle."
        },
        feeToLedger: {
          title:"Fees → Payment → Ledger",
          state:"BLOCKED_MISSING_LEDGER_MODULE",
          metrics:{ feeCharges, feePayments, billedAmount:billed, amountPaidOnCharges:chargePaid, recordedPaymentAmount:paymentRecorded, outstandingAmount:outstanding },
          nextAction:"A school accounting ledger and charge/payment-to-journal posting workflow are not present in this baseline. Complete the accounting integration before treating this journey as closed.",
          blocker:"No accounting journal/ledger models or posting workflow were found in the P105 Prisma schema."
        },
        staffToPayroll: {
          title:"Staff → Attendance → Payroll",
          state:"BLOCKED_MISSING_PAYROLL_MODULE",
          metrics:{ activeStaff, employmentRecords, activeTeacherAssignments:teacherAssignments },
          nextAction:"Complete staff attendance, leave approval, payroll calculation and statutory export workflows before treating this journey as closed.",
          blocker:"No payroll run, payslip or payroll ledger models were found in the P105 Prisma schema."
        },
        parentToMobile: {
          title:"Parent portal → Mobile",
          state: linkedGuardians > 0 && acceptedInvitations > 0 ? "ACTIVE" : "NEEDS_ATTENTION",
          metrics:{ activeGuardians:guardians, linkedGuardians, acceptedInvitations, pendingInvitations, parentNotifications },
          mobileCapabilities:["student profile","attendance","fees","homework","published report cards","notifications"],
          nextAction: pendingInvitations > 0 ? "Complete pending parent invitations and consent acceptance." : "Verify parent-child access and continue mobile synchronization."
        }
      },
      limitations:[
        "This endpoint is a read-only operational summary; it does not perform admissions, payment, accounting, payroll or report-card mutations.",
        "Fee totals are operational school fee charge/payment totals, not a reconciled accounting ledger balance.",
        "Parent mobile capability names reflect the existing mobile client screens; device/runtime delivery is not verified here."
      ]
    };
  });
  return res.json({ data });
}));
