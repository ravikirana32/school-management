import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD").refine(value => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Date must be a real calendar date");
const time24 = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);

export const schoolProfileSchema = z.object({
  legalName: z.string().trim().max(180).optional(),
  displayName: z.string().trim().min(2).max(180),
  schoolType: z.enum(["PUBLIC", "PRIVATE", "AIDED", "INTERNATIONAL", "OTHER"]).optional(),
  boardKey: z.string().trim().max(40).optional(),
  affiliationNumber: z.string().trim().max(80).optional(),
  addressLine1: z.string().trim().max(180).optional(),
  addressLine2: z.string().trim().max(180).optional(),
  locality: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(20).optional(),
  countryCode: z.string().trim().length(2).default("IN"),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(254).optional(),
  website: z.string().url().optional(),
  primaryLanguage: z.string().trim().min(2).max(20).default("en"),
  timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata"),
  currency: z.string().trim().length(3).default("INR"),
  dateFormat: z.enum(["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"]).default("DD-MM-YYYY"),
  weekStartsOn: z.number().int().min(0).max(6).default(1)
}).strict();

export const academicYearSchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().min(2).max(30).regex(/^[A-Za-z0-9_-]+$/),
  startsOn: dateOnly,
  endsOn: dateOnly,
  makeCurrent: z.boolean().default(false)
}).strict().refine(v => v.endsOn >= v.startsOn, { path: ["endsOn"], message: "End date must not precede start date" });

export const academicTermSchema = z.object({
  name: z.string().trim().min(2).max(80),
  code: z.string().trim().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/),
  termType: z.enum(["TERM", "SEMESTER", "QUARTER", "TRIMESTER", "CUSTOM"]).default("TERM"),
  sequence: z.number().int().min(1).max(20),
  startsOn: dateOnly,
  endsOn: dateOnly
}).strict().refine(v => v.endsOn >= v.startsOn, { path: ["endsOn"], message: "End date must not precede start date" });

export const calendarSchema = z.object({
  name: z.string().trim().min(2).max(100),
  academicYearId: z.string().optional(),
  isDefault: z.boolean().default(false)
}).strict();

export const calendarEventSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).optional(),
  eventType: z.enum(["HOLIDAY", "SCHOOL_EVENT", "EXAM", "PARENT_MEETING", "STAFF_EVENT", "CLOSURE", "OTHER"]),
  audience: z.enum(["ALL", "STUDENTS", "STAFF", "PARENTS"]).default("ALL"),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  isAllDay: z.boolean().default(true),
  isInstructionDay: z.boolean().default(false),
  location: z.string().trim().max(160).optional()
}).strict().refine(v => new Date(v.endsAt) >= new Date(v.startsAt), { path: ["endsAt"], message: "Event end must not precede start" });

export const dayConfigurationSchema = z.array(z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isWorkingDay: z.boolean(),
  opensAt: time24.optional(),
  closesAt: time24.optional(),
  notes: z.string().trim().max(250).optional()
}).strict().refine(v => !v.opensAt || !v.closesAt || v.closesAt > v.opensAt, {
  path: ["closesAt"], message: "Closing time must be after opening time"
})).min(1).max(7).refine(items => new Set(items.map(v => v.dayOfWeek)).size === items.length, "Duplicate weekdays are not allowed");

export const schoolPolicySchema = z.object({
  attendance: z.object({
    lateAfterMinutes: z.number().int().min(0).max(240).default(15),
    allowHalfDay: z.boolean().default(true),
    requireReasonForAbsence: z.boolean().default(false)
  }).strict().optional(),
  grading: z.object({
    gradingScale: z.enum(["PERCENTAGE", "LETTER", "GPA", "DESCRIPTIVE"]).default("PERCENTAGE"),
    passingPercentage: z.number().min(0).max(100).default(35),
    decimalPlaces: z.number().int().min(0).max(3).default(0)
  }).strict().optional()
}).strict().refine(v => v.attendance || v.grading, "At least one policy section is required");
