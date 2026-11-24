import { z } from "zod";
const dateOnly = z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/);
export const boardProfileSchema = z.object({
  boardKey: z.enum(["CBSE","CISCE_ICSE","CISCE_ISC","STATE","IB","IGCSE","CUSTOM"]),
  boardName: z.string().trim().min(2).max(160).optional(),
  jurisdictionCountry: z.string().length(2).default("IN"),
  jurisdictionRegion: z.string().trim().max(100).optional(),
  affiliationNumber: z.string().trim().max(100).optional(),
  schoolCategory: z.string().trim().max(80).optional(),
  effectiveFrom: dateOnly.optional(),
  effectiveTo: dateOnly.optional(),
  configuration: z.record(z.unknown()).optional()
}).strict().refine(v => !v.effectiveFrom || !v.effectiveTo || v.effectiveTo >= v.effectiveFrom, {
  path: ["effectiveTo"], message: "Effective end date must not precede start date"
});
export const gradeSchema = z.object({
  code: z.string().trim().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(1).max(80),
  sequence: z.number().int().min(1).max(100),
  stage: z.string().trim().max(40).optional(),
  ageMin: z.number().int().min(0).max(30).optional(),
  ageMax: z.number().int().min(0).max(40).optional(),
  isActive: z.boolean().default(true)
}).strict().refine(v => v.ageMin === undefined || v.ageMax === undefined || v.ageMax >= v.ageMin, {
  path: ["ageMax"], message: "Maximum age must be greater than or equal to minimum age"
});
export const curriculumVersionSchema = z.object({
  academicYearId: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(40).regex(/^[A-Za-z0-9_-]+$/),
  boardKey: z.enum(["CBSE","CISCE_ICSE","CISCE_ISC","STATE","IB","IGCSE","CUSTOM"]),
  versionLabel: z.string().trim().max(60).optional(),
  effectiveFrom: dateOnly.optional(),
  effectiveTo: dateOnly.optional(),
  sourceReference: z.string().trim().max(250).optional(),
  notes: z.string().trim().max(2000).optional()
}).strict().refine(v => !v.effectiveFrom || !v.effectiveTo || v.effectiveTo >= v.effectiveFrom, {
  path: ["effectiveTo"], message: "Effective end date must not precede start date"
});
export const curriculumSubjectSchema = z.object({
  gradeLevelId: z.string().min(1),
  code: z.string().trim().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(1).max(120),
  subjectType: z.enum(["CORE","ELECTIVE","LANGUAGE","VOCATIONAL","CO_CURRICULAR"]).default("CORE"),
  languageCode: z.string().trim().max(20).optional(),
  isMandatory: z.boolean().default(true),
  weeklyPeriods: z.number().int().min(0).max(60).optional(),
  maxMarks: z.number().min(0).max(100000).optional(),
  passMarks: z.number().min(0).max(100000).optional(),
  sequence: z.number().int().min(0).max(1000).default(0),
  metadata: z.record(z.unknown()).optional()
}).strict().refine(v => v.maxMarks === undefined || v.passMarks === undefined || v.passMarks <= v.maxMarks, {
  path: ["passMarks"], message: "Pass marks cannot exceed maximum marks"
});

export const curriculumOutcomeSchema = z.object({
  curriculumSubjectId: z.string().min(1).optional(),
  gradeLevelId: z.string().min(1),
  code: z.string().trim().min(1).max(40).regex(/^[A-Za-z0-9._-]+$/),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(4000).optional(),
  competencyDomain: z.string().trim().max(100).optional(),
  sourceReference: z.string().trim().max(300).optional(),
  sourceEdition: z.string().trim().max(100).optional(),
  sourceUrl: z.string().url().max(1000).optional(),
  provenanceNote: z.string().trim().min(3).max(1000)
}).strict();

export const curriculumOutcomeUpdateSchema = curriculumOutcomeSchema.extend({ curriculumSubjectId: z.string().min(1).nullable().optional() }).partial().strict().refine(v => Object.keys(v).length > 0, {
  message: "At least one outcome field must be provided"
});

export const curriculumOutcomeReviewSchema = z.object({
  reviewStatus: z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED"]),
  reviewNote: z.string().trim().max(1000).optional()
}).strict();
