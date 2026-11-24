export const CONFIG_TRANSFER_VERSION = 1;
export type ConfigTransferTab = "profile" | "working" | "policies" | "academic" | "calendar";
export type ConfigTransferDocument = {
  format: "school-saas-config";
  version: number;
  scope: ConfigTransferTab;
  exportedAt: string;
  data: unknown;
};

export function parseStrictIsoTimestamp(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/);
  if (!match) return null;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, , zone, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const hour = Number(hourText), minute = Number(minuteText), second = Number(secondText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  if (zone !== "Z") {
    const offsetHour = Number(offsetHourText), offsetMinute = Number(offsetMinuteText);
    if (offsetHour > 14 || offsetMinute > 59 || (offsetHour === 14 && offsetMinute !== 0)) return null;
  }
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}


export function createConfigTransfer(scope: ConfigTransferTab, data: unknown, exportedAt = new Date().toISOString()): ConfigTransferDocument {
  return { format: "school-saas-config", version: CONFIG_TRANSFER_VERSION, scope, exportedAt, data };
}

export function validateConfigTransfer(input: unknown, expectedScope: ConfigTransferTab): { valid: boolean; errors: string[]; data?: any } {
  const errors: string[] = [];
  if (!input || typeof input !== "object" || Array.isArray(input)) return { valid: false, errors: ["Import must be a JSON object."] };
  const doc = input as any;
  if (doc.format !== "school-saas-config") errors.push("Unsupported file format.");
  if (doc.version !== CONFIG_TRANSFER_VERSION) errors.push(`Unsupported transfer version (expected ${CONFIG_TRANSFER_VERSION}).`);
  if (doc.scope !== expectedScope) errors.push(`This file is for ${String(doc.scope)}, not ${expectedScope}.`);
  if (!doc.data || typeof doc.data !== "object") errors.push("Missing configuration data object.");
  if (expectedScope === "profile" && doc.data && typeof doc.data === "object") {
    const allowed = ["legalName", "displayName", "schoolType", "boardKey", "affiliationNumber", "addressLine1", "addressLine2", "locality", "city", "state", "postalCode", "countryCode", "phone", "email", "website", "primaryLanguage", "timezone", "currency", "dateFormat", "weekStartsOn"];
    const unknown = Object.keys(doc.data).filter((key) => !allowed.includes(key));
    if (unknown.length) errors.push(`Unknown profile fields: ${unknown.join(", ")}.`);
    if (typeof doc.data.displayName !== "string" || !doc.data.displayName.trim()) errors.push("School displayName is required.");
    if (doc.data.weekStartsOn !== undefined && (!Number.isInteger(doc.data.weekStartsOn) || doc.data.weekStartsOn < 0 || doc.data.weekStartsOn > 6)) errors.push("weekStartsOn must be an integer from 0 through 6.");
  }
  if (expectedScope === "working" && doc.data && typeof doc.data === "object") {
    const days = doc.data.days;
    if (!Array.isArray(days) || days.length !== 7) errors.push("Working-days import must contain exactly 7 day records.");
    else {
      const indexes = new Set<number>();
      days.forEach((day: any, i: number) => {
        if (!day || !Number.isInteger(day.dayOfWeek) || day.dayOfWeek < 0 || day.dayOfWeek > 6) errors.push(`Row ${i + 1}: dayOfWeek must be 0–6.`);
        else if (indexes.has(day.dayOfWeek)) errors.push(`Duplicate weekday index ${day.dayOfWeek}.`);
        else indexes.add(day.dayOfWeek);
        if (typeof day?.isWorkingDay !== "boolean") errors.push(`Row ${i + 1}: isWorkingDay must be boolean.`);
        if (day?.opensAt !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.opensAt)) errors.push(`Row ${i + 1}: opensAt must be HH:mm.`);
        if (day?.closesAt !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(day.closesAt)) errors.push(`Row ${i + 1}: closesAt must be HH:mm.`);
      });
    }
  }
  if (expectedScope === "academic" && doc.data && typeof doc.data === "object") {
    const years = doc.data.academicYears;
    if (!Array.isArray(years) || years.length < 1 || years.length > 20) errors.push("Academic transfer must contain 1–20 academic years.");
    else {
      const yearCodes = new Set<string>();
      years.forEach((year: any, yi: number) => {
        if (!year || typeof year !== "object") { errors.push(`Academic year ${yi + 1} must be an object.`); return; }
        if (typeof year.name !== "string" || !year.name.trim()) errors.push(`Academic year ${yi + 1}: name is required.`);
        if (typeof year.code !== "string" || !year.code.trim()) errors.push(`Academic year ${yi + 1}: code is required.`);
        else { const code = year.code.trim().toLowerCase(); if (yearCodes.has(code)) errors.push(`Duplicate academic year code ${year.code}.`); yearCodes.add(code); }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(year.startsOn ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(year.endsOn ?? "") || year.endsOn < year.startsOn) errors.push(`Academic year ${yi + 1}: valid start/end dates are required and end must not precede start.`);
        const terms = year.terms ?? [];
        if (!Array.isArray(terms)) errors.push(`Academic year ${yi + 1}: terms must be an array.`);
        else {
          const termCodes = new Set<string>(); const sequences = new Set<number>();
          terms.forEach((term: any, ti: number) => {
            if (!term || typeof term !== "object") { errors.push(`Academic year ${yi + 1}, term ${ti + 1} must be an object.`); return; }
            if (typeof term.name !== "string" || !term.name.trim()) errors.push(`Academic year ${yi + 1}, term ${ti + 1}: name is required.`);
            if (typeof term.code !== "string" || !term.code.trim()) errors.push(`Academic year ${yi + 1}, term ${ti + 1}: code is required.`);
            else { const code = term.code.trim().toLowerCase(); if (termCodes.has(code)) errors.push(`Academic year ${yi + 1}: duplicate term code ${term.code}.`); termCodes.add(code); }
            if (!Number.isInteger(term.sequence) || term.sequence < 1 || term.sequence > 20) errors.push(`Academic year ${yi + 1}, term ${ti + 1}: sequence must be 1–20.`);
            else { if (sequences.has(term.sequence)) errors.push(`Academic year ${yi + 1}: duplicate term sequence ${term.sequence}.`); sequences.add(term.sequence); }
            if (!["TERM", "SEMESTER", "QUARTER", "TRIMESTER", "CUSTOM"].includes(term.termType)) errors.push(`Academic year ${yi + 1}, term ${ti + 1}: unsupported termType.`);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(term.startsOn ?? "") || !/^\d{4}-\d{2}-\d{2}$/.test(term.endsOn ?? "") || term.endsOn < term.startsOn || term.startsOn < year.startsOn || term.endsOn > year.endsOn) errors.push(`Academic year ${yi + 1}, term ${ti + 1}: dates must be valid and within the academic year.`);
          });
        }
      });
    }
  }
  if (expectedScope === "calendar" && doc.data && typeof doc.data === "object") {
    const calendar = doc.data.calendar;
    if (!calendar || typeof calendar !== "object" || typeof calendar.name !== "string" || !calendar.name.trim()) errors.push("Calendar name is required.");
    const events = doc.data.events;
    if (!Array.isArray(events) || events.length > 500) errors.push("Calendar transfer must contain an events array with at most 500 entries.");
    else {
      const eventKeys = new Set<string>();
      events.forEach((event: any, i: number) => {
        if (!event || typeof event !== "object") { errors.push(`Event ${i + 1} must be an object.`); return; }
        if (typeof event.title !== "string" || !event.title.trim()) errors.push(`Event ${i + 1}: title is required.`);
        if (!["HOLIDAY", "SCHOOL_EVENT", "EXAM", "PARENT_MEETING", "STAFF_EVENT", "CLOSURE", "OTHER"].includes(event.eventType)) errors.push(`Event ${i + 1}: unsupported eventType.`);
        const startTimestamp = parseStrictIsoTimestamp(event.startsAt);
        const endTimestamp = parseStrictIsoTimestamp(event.endsAt);
        if (startTimestamp === null || endTimestamp === null || endTimestamp < startTimestamp) errors.push(`Event ${i + 1}: valid start/end timestamps must be ISO 8601 date-times with an explicit timezone and end must not precede start.`);
        if (event.isAllDay !== undefined && typeof event.isAllDay !== "boolean") errors.push(`Event ${i + 1}: isAllDay must be boolean.`);
        if (event.isInstructionDay !== undefined && typeof event.isInstructionDay !== "boolean") errors.push(`Event ${i + 1}: isInstructionDay must be boolean.`);
        if (event.audience !== undefined && typeof event.audience !== "string") errors.push(`Event ${i + 1}: audience must be a string.`);
        const key = `${String(event.title ?? "").trim().toLowerCase()}|${String(event.startsAt ?? "")}`;
        if (eventKeys.has(key)) errors.push(`Event ${i + 1}: duplicate title/start time.`);
        eventKeys.add(key);
      });
    }
  }
  if (expectedScope === "policies" && doc.data && typeof doc.data === "object") {
    if (!doc.data.attendance || typeof doc.data.attendance !== "object") errors.push("Attendance policy is required.");
    if (!doc.data.grading || typeof doc.data.grading !== "object") errors.push("Grading policy is required.");
    const p = doc.data.grading;
    if (p && p.passingPercentage !== undefined && (typeof p.passingPercentage !== "number" || p.passingPercentage < 0 || p.passingPercentage > 100)) errors.push("passingPercentage must be 0–100.");
    if (p && p.decimalPlaces !== undefined && (!Number.isInteger(p.decimalPlaces) || p.decimalPlaces < 0 || p.decimalPlaces > 3)) errors.push("decimalPlaces must be 0–3.");
  }
  return { valid: errors.length === 0, errors, data: doc.data };
}
