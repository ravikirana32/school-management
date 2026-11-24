export const TIMETABLE_CSV_HEADERS = ["teacherAssignmentId", "academicYearId", "dayOfWeek", "periodNumber", "startsAt", "endsAt", "subjectName", "room", "effectiveFrom", "effectiveTo"] as const;
export type CsvRow = Record<(typeof TIMETABLE_CSV_HEADERS)[number], string>;

/** Bounded RFC4180-style parser: quoted commas/newlines and escaped quotes are supported. */
export function parseTimetableCsv(input: string): { rows: CsvRow[]; errors: { row: number; message: string }[] } {
  if (input.length > 1_000_000) return { rows: [], errors: [{ row: 0, message: "CSV exceeds 1 MB limit" }] };
  const records: string[][] = [];
  let row: string[] = [], field = "", quoted = false, afterQuote = false;
  const finishField = () => { row.push(field); field = ""; afterQuote = false; };
  const finishRow = () => { finishField(); records.push(row); row = []; };
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; afterQuote = true; }
      else field += ch;
      continue;
    }
    if (afterQuote) {
      if (ch === ",") finishField();
      else if (ch === "\n") finishRow();
      else if (ch === "\r" && input[i + 1] === "\n") { i++; finishRow(); }
      else return { rows: [], errors: [{ row: records.length + 1, message: "Unexpected characters after a closing quote" }] };
      continue;
    }
    if (ch === '"') {
      if (field.length) return { rows: [], errors: [{ row: records.length + 1, message: "Unexpected quote in unquoted field" }] };
      quoted = true;
    } else if (ch === ",") finishField();
    else if (ch === "\n") finishRow();
    else field += ch;
  }
  if (quoted) return { rows: [], errors: [{ row: records.length + 1, message: "Unclosed quoted field" }] };
  if (field.length || row.length || afterQuote) finishRow();
  while (records.length && records[records.length - 1].every(v => !v.trim())) records.pop();
  if (!records.length) return { rows: [], errors: [{ row: 1, message: "CSV is empty" }] };
  const expected = [...TIMETABLE_CSV_HEADERS];
  const headers = records[0].map(v => v.trim());
  if (headers.length !== expected.length || headers.some((v, i) => v !== expected[i]))
    return { rows: [], errors: [{ row: 1, message: `Headers must exactly match: ${expected.join(",")}` }] };
  if (records.length === 1) return { rows: [], errors: [{ row: 2, message: "CSV must contain at least one data row" }] };
  if (records.length - 1 > 500) return { rows: [], errors: [{ row: 0, message: "Maximum 500 data rows per CSV" }] };
  const rows: CsvRow[] = [], errors: { row: number; message: string }[] = [];
  records.slice(1).forEach((values, index) => {
    const line = index + 2;
    if (values.length !== expected.length) { errors.push({ row: line, message: `Expected ${expected.length} columns, received ${values.length}` }); return; }
    const value = Object.fromEntries(expected.map((key, i) => [key, values[i].trim()])) as CsvRow;
    if (expected.slice(0, 7).some(key => !value[key])) { errors.push({ row: line, message: "Required fields cannot be blank" }); return; }
    rows.push(value);
  });
  return { rows, errors };
}

export function serializeTimetableCsv(rows: Record<string, unknown>[]): string {
  const quote = (value: unknown) => {
    const text = value == null ? "" : value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [TIMETABLE_CSV_HEADERS.join(","), ...rows.map(row => TIMETABLE_CSV_HEADERS.map(key => quote(row[key])).join(","))].join("\r\n");
}
