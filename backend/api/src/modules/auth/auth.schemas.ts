import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(12).max(128),
  displayName: z.string().trim().min(2).max(120)
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(1).max(128)
}).strict();

export const refreshSchema = z.object({ refreshToken: z.string().min(32).max(512) }).strict();
