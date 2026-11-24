import { readFileSync } from "node:fs";
const source = readFileSync("backend/api/src/modules/students/student.routes.ts", "utf8");
const assertions = [
  ["student/year duplicate precheck", /studentId:student\.id, academicYearId:year\.id/],
  ["roll number conflict precheck", /gradeLevelId:grade\.id, rollNumber:parsed\.data\.rollNumber/],
  ["race conflict mapping", /error\?\.code === \"P2002\"[\s\S]*CONCURRENT_CONFLICT/],
  ["409 duplicate enrollment response", /ALREADY_ENROLLED[\s\S]*status\(409\)/],
  ["409 roll-number response", /ROLL_NUMBER_TAKEN[\s\S]*status\(409\)/],
];
let failed = false;
for (const [label, regex] of assertions) { const ok = regex.test(source); console.log(`${ok ? "PASS" : "FAIL"}: ${label}`); failed ||= !ok; }
if (failed) process.exit(1);
