import { z } from "zod";

export const onboardOrganizationSchema = z.object({
  organizationName: z.string().trim().min(2).max(160),
  organizationSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  country: z.string().trim().length(2).default("IN"),
  timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata"),
  schoolName: z.string().trim().min(2).max(160),
  schoolCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{2,30}$/)
}).strict();

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{2,30}$/),
  timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata")
}).strict();

export const inviteMemberSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  roleKey: z.enum(["ORG_ADMIN","SCHOOL_ADMIN","TEACHER","PARENT","ACCOUNTANT"]),
  schoolId: z.string().min(1).optional()
}).strict().superRefine((value, ctx) => {
  if (value.roleKey === "ORG_ADMIN" && value.schoolId) {
    ctx.addIssue({ code: "custom", path: ["schoolId"], message: "Organization admin invitations cannot be school-scoped" });
  }
  if (value.roleKey !== "ORG_ADMIN" && !value.schoolId) {
    ctx.addIssue({ code: "custom", path: ["schoolId"], message: "A school is required for school-scoped roles" });
  }
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(32).max(512)
}).strict();
