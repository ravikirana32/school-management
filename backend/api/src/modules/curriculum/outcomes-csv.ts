export const outcomeCsvHeaders = [
  "gradeCode", "subjectCode", "code", "title", "description", "competencyDomain",
  "sourceReference", "sourceEdition", "sourceUrl", "provenanceNote"
] as const;

export function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function rowsToCsv(rows: Array<Record<string, unknown>>, headers: readonly string[] = outcomeCsvHeaders): string {
  return [headers.join(","), ...rows.map(row => headers.map(header => csvCell(row[header])).join(","))].join("\r\n");
}
/** RFC4180-ish parser supporting quoted commas, doubled quotes, and embedded newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell.length === 0) quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(value => value.trim() !== "")) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field");
  row.push(cell);
  if (row.some(value => value.trim() !== "")) rows.push(row);
  return rows;
}
