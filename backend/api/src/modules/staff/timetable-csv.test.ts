import { describe, expect, it } from "vitest";
import { parseTimetableCsv, serializeTimetableCsv, TIMETABLE_CSV_HEADERS } from "./timetable-csv.js";

const header = TIMETABLE_CSV_HEADERS.join(",");
const dataRow = "assign,year,1,2,09:00,09:45,\"Math, Algebra\",A101,,";
describe("timetable CSV", () => {
  it("parses strict headers, CRLF and quoted commas", () => {
    const result = parseTimetableCsv(`${header}\r\n${dataRow}`);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].subjectName).toBe("Math, Algebra");
  });
  it("rejects reordered or unexpected headers", () => {
    expect(parseTimetableCsv("dayOfWeek,teacherAssignmentId").errors[0].message).toContain("Headers must exactly match");
  });
  it("rejects malformed quotes and characters after closing quotes", () => {
    expect(parseTimetableCsv(`${header}\nassign,year,1,2,09:00,09:45,\"Math`).errors[0].message).toContain("Unclosed");
    expect(parseTimetableCsv(`${header}\nassign,year,1,2,09:00,09:45,\"Math\"x,A101,,`).errors[0].message).toContain("after a closing quote");
  });
  it("requires data rows and caps batches at 500", () => {
    expect(parseTimetableCsv(header).errors[0].message).toContain("at least one data row");
    expect(parseTimetableCsv(`${header}\n${Array.from({ length: 501 }, () => "assign,year,1,2,09:00,09:45,Math,,,,").join("\n")}`).errors[0].message).toContain("500");
  });
  it("exports escaped CSV cells", () => {
    const text = serializeTimetableCsv([{ subjectName: "Math, Algebra" }]);
    expect(text).toContain('"Math, Algebra"');
  });
});
