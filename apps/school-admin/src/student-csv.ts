export type StudentImportRow = { rowNumber:number; admissionNumber:string; firstName:string; lastName:string; admissionDate:string; errors:string[] };
export function parseStudentCsv(text:string):StudentImportRow[] {
  const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(line=>line.trim());
  if(!lines.length) return [];
  const parseLine=(line:string)=>{const cells:string[]=[];let value="",quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){cells.push(value);value="";}else value+=c;}cells.push(value);return cells;};
  const headers=parseLine(lines[0]).map(h=>h.trim().toLowerCase());
  const required=["admissionnumber","firstname"];
  const missing=required.filter(h=>!headers.includes(h));if(missing.length)throw new Error(`CSV missing required column(s): ${missing.join(", ")}`);
  return lines.slice(1).map((line,index)=>{const cells=parseLine(line);const get=(key:string)=>String(cells[headers.indexOf(key)]??"").trim();const admissionNumber=get("admissionnumber"),firstName=get("firstname"),lastName=get("lastname"),admissionDate=get("admissiondate");const errors:string[]=[];
    if(!admissionNumber)errors.push("Admission number is required");else if(!/^[A-Za-z0-9/_-]+$/.test(admissionNumber))errors.push("Admission number contains invalid characters");
    if(!firstName)errors.push("First name is required");
    if(admissionDate){if(!/^\d{4}-\d{2}-\d{2}$/.test(admissionDate))errors.push("Admission date must be YYYY-MM-DD");else {const [y,m,d]=admissionDate.split("-").map(Number);const parsed=new Date(Date.UTC(y,m-1,d));if(parsed.getUTCFullYear()!==y||parsed.getUTCMonth()!==m-1||parsed.getUTCDate()!==d)errors.push("Admission date is not a valid calendar date");}}
    return {rowNumber:index+2,admissionNumber,firstName,lastName,admissionDate,errors};
  });
}
export function csvCell(value:unknown){return `"${String(value??"").replace(/"/g,'""')}"`;}
export function studentRowsToCsv(rows:Record<string,unknown>[],fields:string[]){return [fields.join(","),...rows.map(row=>fields.map(field=>csvCell(row[field])).join(","))].join("\r\n");}
