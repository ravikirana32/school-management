import { z } from "zod";

export const parentAttendanceQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: z.string().trim().min(1).max(128).optional()
}).refine(value => !value.from || !value.to || value.from <= value.to);

export function parentAttendanceDateFilter(range: { from?: string; to?: string }) {
  const filter: { gte?: Date; lt?: Date } = {};
  if (range.from) filter.gte = new Date(`${range.from}T00:00:00.000Z`);
  if (range.to) {
    const exclusiveUpperBound = new Date(`${range.to}T00:00:00.000Z`);
    exclusiveUpperBound.setUTCDate(exclusiveUpperBound.getUTCDate() + 1);
    filter.lt = exclusiveUpperBound;
  }
  return filter;
}

export function sliceParentAttendancePage<T extends { id: string }>(rows: T[], limit: number) {
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  return {
    data,
    nextCursor: hasMore ? data[data.length - 1]?.id ?? null : null,
    hasMore
  };
}
