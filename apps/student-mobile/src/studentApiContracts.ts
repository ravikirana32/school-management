/** Runtime guards for student portal API payloads. */
export type StudentSchoolContract = {
  organization: { id: string; name: string };
  school: { id: string; name: string; code: string; timezone: string };
  student: { id: string; admissionNumber: string; firstName: string; lastName?: string | null; preferredName?: string | null };
};

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const hasString = (value: unknown): value is string => typeof value === "string";

export function normalizeStudentSchoolList(value: unknown): StudentSchoolContract[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error("Student schools response contract mismatch: expected an array");
  return value.map((row, index) => {
    if (!isRecord(row) || !isRecord(row.organization) || !isRecord(row.school) || !isRecord(row.student))
      throw new Error(`Student schools response contract mismatch at item ${index}`);
    const { organization, school, student } = row;
    if (![organization.id, organization.name, school.id, school.name, school.code, school.timezone, student.id, student.admissionNumber, student.firstName].every(hasString))
      throw new Error(`Student schools response contract mismatch: required string missing at item ${index}`);
    return row as unknown as StudentSchoolContract;
  });
}

export function normalizeStudentList<T>(value: unknown, endpoint: string): T[] {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(`${endpoint} response contract mismatch: expected an array`);
  return value as T[];
}

export function validateStudentProfile(value: unknown): void {
  if (!isRecord(value) || !hasString(value.id) || !hasString(value.admissionNumber) || !hasString(value.firstName) || !hasString(value.status) || !Array.isArray(value.enrollments))
    throw new Error("Student profile response contract mismatch");
}
