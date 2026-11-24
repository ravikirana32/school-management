import assert from "node:assert/strict";
import { parseCsv, rowsToCsv, outcomeCsvHeaders } from "../backend/api/src/modules/curriculum/outcomes-csv.ts";
const sample = [
  outcomeCsvHeaders.join(","),
  'G1,S-MATH,OUT-1,"Title, with comma","Line 1\\nLine 2",Domain,"Source, book",Edition,https://example.com,"Required provenance note"',
  'G1,,OUT-2,Second outcome,,,,,,Authored locally'
].join("\r\n");
const parsed = parseCsv(sample);
assert.equal(parsed.length, 3, "parses CRLF separated records");
assert.equal(parsed[1][3], "Title, with comma", "quoted comma is preserved");
assert.equal(parsed[1][4], "Line 1\\nLine 2", "literal newline escape content remains");
const csv = rowsToCsv([{ code: "A", title: "Quoted, value", description: 'say "hello"\nnext' }], ["code", "title", "description"]);
const parsedExport = parseCsv(csv);
assert.deepEqual(parsedExport[1], ["A", "Quoted, value", 'say "hello"\nnext'], "CSV output round trips quoting and embedded newline");
assert.deepEqual(parseCsv("a,b\r\n1,\"two\r\nlines\"\r\n3"), [["a", "b"], ["1", "two\r\nlines"], ["3"]], "quoted CRLF stays inside cell and row boundaries are preserved");
assert.throws(() => parseCsv('a,b\n"unterminated,c'), /unterminated quoted field/);
console.log("P415 CSV runtime smoke: 5/5 PASS");
