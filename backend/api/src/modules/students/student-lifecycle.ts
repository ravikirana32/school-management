export type StudentLifecycleStatus = 'APPLICANT' | 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'WITHDRAWN' | 'ARCHIVED';
const transitions: Record<StudentLifecycleStatus, readonly StudentLifecycleStatus[]> = {
  APPLICANT: ['ACTIVE', 'WITHDRAWN', 'ARCHIVED'],
  ACTIVE: ['INACTIVE', 'TRANSFERRED', 'GRADUATED', 'WITHDRAWN'],
  INACTIVE: ['ACTIVE', 'WITHDRAWN', 'ARCHIVED'],
  TRANSFERRED: ['ARCHIVED'],
  GRADUATED: ['ARCHIVED'],
  WITHDRAWN: ['ARCHIVED'],
  ARCHIVED: [],
};
export function canTransitionStudent(from: StudentLifecycleStatus, to: StudentLifecycleStatus): boolean {
  return transitions[from]?.includes(to) ?? false;
}
export function isStudentExitStatus(status: StudentLifecycleStatus): boolean {
  return status === 'TRANSFERRED' || status === 'GRADUATED' || status === 'WITHDRAWN';
}

export type StudentEnrollmentStatus = 'ENROLLED' | 'PROMOTED' | 'TRANSFERRED' | 'WITHDRAWN' | 'COMPLETED';
const enrollmentTransitions: Record<StudentEnrollmentStatus, readonly StudentEnrollmentStatus[]> = {
  ENROLLED: ['PROMOTED', 'TRANSFERRED', 'WITHDRAWN', 'COMPLETED'],
  PROMOTED: ['TRANSFERRED', 'WITHDRAWN', 'COMPLETED'],
  TRANSFERRED: [],
  WITHDRAWN: [],
  COMPLETED: [],
};
export function canTransitionEnrollment(from: StudentEnrollmentStatus, to: StudentEnrollmentStatus): boolean {
  return enrollmentTransitions[from]?.includes(to) ?? false;
}
export function isEnrollmentExitStatus(status: StudentEnrollmentStatus): boolean {
  return status === 'TRANSFERRED' || status === 'WITHDRAWN' || status === 'COMPLETED';
}
