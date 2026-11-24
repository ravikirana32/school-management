import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  country: z.string().trim().length(2).default("IN"),
  timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata")
}).strict();

export const updateTenantStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "DEACTIVATED", "ARCHIVED"]),
  reason: z.string().trim().min(8).max(500)
}).strict();

export const createSchoolSchema = z.object({
  name: z.string().trim().min(2).max(160),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{2,30}$/),
  timezone: z.string().trim().min(3).max(80).default("Asia/Kolkata")
}).strict();

export const supportGrantSchema = z.object({
  organizationId: z.string().min(1),
  grantedTo: z.string().min(1),
  reason: z.string().trim().min(10).max(500),
  ticketReference: z.string().trim().max(80).optional(),
  startsAt: z.coerce.date(),
  expiresAt: z.coerce.date()
}).strict().refine(v => v.expiresAt > v.startsAt, { message: "Grant expiry must be after start" });
