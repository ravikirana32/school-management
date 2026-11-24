export function isStrictlyAfter(previousStart: Date, nextStart: Date): boolean {
  return nextStart.getTime() > previousStart.getTime();
}

export function dayBefore(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() - 1));
}
