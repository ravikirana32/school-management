import { useMemo, useState } from "react";

type Mark = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "EXCUSED" | "LEAVE";
const demoStudents = [
  { id:"STU-001", name:"Aarav Sharma", roll:"01" },
  { id:"STU-002", name:"Ananya Rao", roll:"02" },
  { id:"STU-003", name:"Ishaan Kumar", roll:"03" },
  { id:"STU-004", name:"Diya Patel", roll:"04" }
];
export function AttendancePreview() {
  const [marks,setMarks]=useState<Record<string,Mark>>({});
  const [state,setState]=useState<"DRAFT"|"OPEN"|"SUBMITTED"|"LOCKED">("DRAFT");
  const marked=useMemo(()=>Object.keys(marks).length,[marks]);
  const options:Mark[]=["PRESENT","ABSENT","LATE","HALF_DAY","EXCUSED","LEAVE"];
  return <section style={{padding:24}}>
    <h2>Student attendance</h2>
    <p>Local preview only — changes are held in browser state and are not saved to the API.</p>
    <p>Grade 5 · Section A · 16 Nov 2026 · Session: <strong>{state}</strong></p>
    <button disabled={state!=="DRAFT"} onClick={()=>setState("OPEN")}>Open session</button>
    <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
      <thead><tr><th align="left">Student</th><th>Roll</th><th>Attendance</th></tr></thead>
      <tbody>{demoStudents.map(s=><tr key={s.id}><td>{s.name}</td><td align="center">{s.roll}</td><td align="center">
        <select disabled={state!=="OPEN"} value={marks[s.id]||""} onChange={e=>setMarks(p=>({...p,[s.id]:e.target.value as Mark}))}>
          <option value="">Select</option>{options.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </td></tr>)}</tbody>
    </table>
    <p>{marked} of {demoStudents.length} marked</p>
    <button disabled={state!=="OPEN"||!marked} onClick={()=>setState("SUBMITTED")}>Submit attendance</button>
    <button disabled={state!=="SUBMITTED"} onClick={()=>setState("LOCKED")}>Lock session</button>
  </section>;
}
