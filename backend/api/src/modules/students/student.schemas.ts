import { z } from "zod";
const dateOnly = z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/, "Date must use YYYY-MM-DD").refine(value => {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}, "Date must be a real calendar date");
const optionalText = (max: number) => z.string().trim().max(max).optional();
export const guardianInputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: optionalText(100),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(5).max(30),
  alternatePhone: optionalText(30),
  occupation: optionalText(100),
  address: optionalText(500),
  relationship: z.enum(["MOTHER","FATHER","LEGAL_GUARDIAN","GRANDPARENT","SIBLING","OTHER"]),
  isPrimary: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
  canPickup: z.boolean().default(false),
  canReceiveCommunications: z.boolean().default(true)
}).strict();

export const createStudentSchema = z.object({
  admissionNumber: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9/_-]+$/),
  firstName: z.string().trim().min(1).max(100),
  middleName: optionalText(100),
  lastName: optionalText(100),
  preferredName: optionalText(100),
  dateOfBirth: dateOnly.optional(),
  gender: z.enum(["FEMALE","MALE","NON_BINARY","UNDISCLOSED"]).optional(),
  bloodGroup: z.enum(["A_POSITIVE","A_NEGATIVE","B_POSITIVE","B_NEGATIVE","AB_POSITIVE","AB_NEGATIVE","O_POSITIVE","O_NEGATIVE","UNKNOWN"]).optional(),
  nationality: optionalText(80),
  primaryLanguage: optionalText(20),
  email: z.string().trim().email().max(254).optional(),
  phone: optionalText(30),
  addressLine1: optionalText(180),
  addressLine2: optionalText(180),
  locality: optionalText(100),
  city: optionalText(100),
  state: optionalText(100),
  postalCode: optionalText(20),
  countryCode: z.string().length(2).default("IN"),
  admissionDate: dateOnly.optional(),
  notes: optionalText(2000),
  previousSchoolName: optionalText(160),
  previousSchoolBoard: optionalText(80),
  previousSchoolGrade: optionalText(80),
  previousSchoolLeavingDate: dateOnly.optional(),
  medicalConditions: optionalText(2000),
  allergies: optionalText(2000),
  medicationNotes: optionalText(2000),
  emergencyMedicalNotes: optionalText(2000),
  guardians: z.array(guardianInputSchema).max(6).default([])
}).strict();

export const enrollmentSchema = z.object({
  academicYearId: z.string().min(1),
  gradeLevelId: z.string().min(1),
  sectionName: optionalText(40),
  rollNumber: optionalText(40),
  enrolledOn: dateOnly,
  status: z.enum(["ENROLLED","PROMOTED","TRANSFERRED","WITHDRAWN","COMPLETED"]).default("ENROLLED")
}).strict();

export const pickupContactSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  relationship: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(5).max(30),
  identityNote: optionalText(250),
  validFrom: dateOnly.optional(),
  validUntil: dateOnly.optional()
}).strict().refine(v => !v.validFrom || !v.validUntil || v.validUntil >= v.validFrom, {
  path: ["validUntil"], message: "Validity end must not precede start"
});

export const studentDocumentSchema = z.object({
  documentType: z.enum(["BIRTH_CERTIFICATE","TRANSFER_CERTIFICATE","PHOTO","ADDRESS_PROOF","IDENTITY_PROOF","MEDICAL","PREVIOUS_MARKSHEET","CONSENT","OTHER"]),
  displayName: z.string().trim().min(1).max(160),
  objectKey: z.string().trim().min(5).max(500).refine(v => !v.startsWith("/") && !v.includes("..") && !v.includes("://"), "Use a private object-storage key, not a URL or path traversal"),
  mimeType: optionalText(120),
  sizeBytes: z.number().int().nonnegative().max(100_000_000).optional(),
  issuedAt: dateOnly.optional(),
  expiresAt: dateOnly.optional()
}).strict().refine(v => !v.issuedAt || !v.expiresAt || v.expiresAt >= v.issuedAt, {
  path: ["expiresAt"], message: "Expiry date must not precede issue date"
});

export const enrollmentStatusChangeSchema = z.object({
  status: z.enum(["PROMOTED","TRANSFERRED","WITHDRAWN","COMPLETED"]),
  endedOn: dateOnly.optional()
}).strict();
