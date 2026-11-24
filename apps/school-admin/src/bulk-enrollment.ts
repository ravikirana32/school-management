export type BulkEnrollmentRow = {
  admissionNumber: string;
  academicYearId: string;
  gradeLevelId: string;
  sectionName: string;
  enrolledOn: string;
  rollNumber: string;
};

export type BulkEnrollmentPreview = BulkEnrollmentRow & { rowNumber: number; errors: string[] };

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let value = "", quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && quoted && line[i + 1] === '"') { value += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { result.push(value.trim()); value = ""; }
    else value += ch;
  }
  result.push(value.trim());
  return result;
}


export function parseBulkEnrollmentCsv(csv: string): BulkEnrollmentPreview[] {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const required = ["admissionnumber", "academicyearid", "gradelevelid", "sectionname", "enrolledon"];
  const missing = required.filter(field => !header.includes(field));
  if (missing.length) throw new Error(`CSV missing required columns: ${missing.join(", ")}`);
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const value = (name: string) => values[header.indexOf(name)] || "";
    const row: BulkEnrollmentRow = { admissionNumber: value("admissionnumber"), academicYearId: value("academicyearid"), gradeLevelId: value("gradelevelid"), sectionName: value("sectionname"), enrolledOn: value("enrolledon"), rollNumber: header.includes("rollnumber") ? value("rollnumber") : "" };
    const errors: string[] = [];
    if (!row.admissionNumber) errors.push("Admission number required");
    if (!row.academicYearId) errors.push("Academic year required");
    if (!row.gradeLevelId) errors.push("Grade level required");
    if (!row.sectionName) errors.push("Section required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.enrolledOn) || Number.isNaN(Date.parse(`${row.enrolledOn}T00:00:00Z`)) || new Date(`${row.enrolledOn}T00:00:00Z`).toISOString().slice(0, 10) !== row.enrolledOn) errors.push("Enrollment date must be a valid YYYY-MM-DD");
    return { ...row, rowNumber: index + 2, errors };
  });
}
