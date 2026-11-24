import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const route = fs.readFileSync(path.join(root, "backend/api/src/modules/curriculum/curriculum.routes.ts"), "utf8");
const csv = fs.readFileSync(path.join(root, "backend/api/src/modules/curriculum/outcomes-csv.ts"), "utf8");
const ui = fs.readFileSync(path.join(root, "apps/school-admin/src/CurriculumOutcomesWorkspace.tsx"), "utf8");
const checks = [
  ["CSV helper declares import/export columns", csv.includes("gradeCode") && csv.includes("subjectCode") && csv.includes("provenanceNote")],
  ["CSV writer escapes quoted fields", csv.includes("replace(/\"/g") && csv.includes("\\r\\n")],
  ["CSV parser handles quoted fields", csv.includes("if (quoted)") && csv.includes("quoted = false")],
  ["Template endpoint validates school/version", route.includes("outcomes/import-template") && route.includes("Curriculum version not found")],
  ["Export supports review status and grade filters", route.includes("outcomes/export") && route.includes("gradeCode") && route.includes("reviewStatus")],
  ["Export uses CSV serialization", route.includes("rowsToCsv(rows)")],
  ["Preview requires academics.manage", route.includes("outcomes/import-preview") && route.includes('scope(req, res, "academics.manage")')],
  ["Import checks subscription entitlement", route.toLowerCase().includes("curriculum configuration is not included in the active subscription".toLowerCase())],
  ["Import validates payload size", route.includes("csvText") && route.includes("1_500_000")],
  ["Import validates grade code in school scope", route.includes("gradeLevel.findFirst") && route.includes("gradeCode")],
  ["Import validates subject within version and grade", route.includes("curriculumSubject.findFirst") && route.includes("curriculumVersionId: versionId")],
  ["Import detects existing and in-file duplicates", route.includes("duplicateKeys") && route.includes("duplicateDb")],
  ["Import validates rows with curriculum outcome schema", route.includes("curriculumOutcomeSchema.safeParse(payload)")],
  ["Import refuses any validation issue", route.includes("if (result.issues.length) return res.status(422)")],
  ["Commit revalidates and bulk creates", route.includes("finalCheck") && route.includes("curriculumOutcome.createMany")],
  ["Imported records are DRAFT, not approved", route.includes('reviewStatus: "DRAFT"') && route.includes("not automatically approved")],
  ["Admin UI provides template and export", ui.includes("Download template") && ui.includes("Export outcomes")],
  ["Admin UI accepts CSV file and pasted text", ui.includes("text/csv") && ui.includes("CSV content")],
  ["Admin UI has preview and commit controls", ui.includes("Validate / preview") && ui.includes("Import valid preview")],
  ["Admin UI displays row-level issue details", ui.includes("importPreview?.issues") && ui.includes("issue.row") && ui.includes("issue.message")],
  ["Admin UI disables commit when preview has issues", ui.includes("Number(importPreview.invalidCount) !== 0")],
  ["Import confirmation and refresh flow present", ui.includes("window.confirm") && ui.includes("await loadOutcomes(selectedVersion)")],
  ["Template/export honor selected version", ui.includes("!selectedVersion") && ui.includes("outcomesPath")],
];
let passed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (ok) passed++; }
console.log(`P415 Curriculum Outcome CSV verifier: ${passed}/${checks.length} PASS`);
if (passed !== checks.length) process.exit(1);
