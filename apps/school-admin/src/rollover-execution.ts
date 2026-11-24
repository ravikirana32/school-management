import { applyRolloverCapacityChecks, type RolloverCapacitySnapshot } from "./rollover-capacity.ts";
import { validateRolloverRows, type EnrollmentRolloverRow, type RolloverStudentSnapshot } from "./enrollment-rollover.ts";

export type RolloverExecutionState = { admissionNumber:string; enrollments:Array<{academicYearId:string;gradeLevelId:string;sectionName:string|null;status:string}> };
/** Revalidate rows against refreshed enrollment state and capacity immediately before execution. */
export function revalidateRolloverExecution(rows:EnrollmentRolloverRow[], students:RolloverExecutionState[], capacities:RolloverCapacitySnapshot[]) {
 const snapshots:RolloverStudentSnapshot[]=students.map(s=>({admissionNumber:s.admissionNumber,enrollments:s.enrollments.map(e=>({academicYearId:e.academicYearId,status:e.status,gradeLevelId:e.gradeLevelId,sectionName:e.sectionName}))}));
 return applyRolloverCapacityChecks(validateRolloverRows(rows,snapshots),capacities);
}
/** Detect a target enrollment already committed by an earlier/interrupted attempt. */
export function findExistingTargetEnrollment(row:EnrollmentRolloverRow, enrollments:RolloverExecutionState["enrollments"]) {
 return enrollments.find(e=>e.academicYearId===row.targetAcademicYearId&&e.gradeLevelId===row.targetGradeLevelId&&(e.sectionName||"").trim().toLowerCase()===row.targetSectionName.trim().toLowerCase()&&["ENROLLED","PROMOTED"].includes(e.status.toUpperCase()));
}
