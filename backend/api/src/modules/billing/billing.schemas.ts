import { z } from "zod";

export const startSubscriptionSchema = z.object({
  planKey: z.string().trim().min(2).max(60),
  interval: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY")
}).strict();

export const checkoutSchema = z.object({
  invoiceId: z.string().min(1),
  returnUrl: z.string().url().refine(v => v.startsWith("https://") || v.startsWith("http://localhost"), "Return URL must use HTTPS")
}).strict();

export const webhookSchema = z.object({
  id: z.string().min(1).max(200),
  type: z.string().min(1).max(120),
  data: z.object({
    paymentAttemptId: z.string().optional(),
    status: z.enum(["SUCCEEDED", "FAILED", "CANCELED"]).optional(),
    providerReference: z.string().optional()
  }).passthrough()
}).passthrough();
