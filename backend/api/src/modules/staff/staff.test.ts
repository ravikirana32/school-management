import { describe, expect, it } from "vitest";

const terminal = new Set(["TERMINATED","RESIGNED"]);
const mayReactivate = (current:string,next:string) => !(terminal.has(current) && !terminal.has(next));
describe("staff lifecycle rules",()=>{
 it("prevents reactivation of separated staff through ordinary status update",()=>{expect(mayReactivate("TERMINATED","ACTIVE")).toBe(false);expect(mayReactivate("RESIGNED","ON_LEAVE")).toBe(false);});
 it("allows normal active and leave transitions",()=>{expect(mayReactivate("ACTIVE","ON_LEAVE")).toBe(true);expect(mayReactivate("ON_LEAVE","ACTIVE")).toBe(true);});
 it("requires assignment end date not precede start date",()=>{expect("2026-11-01">="2026-10-01").toBe(true);expect("2026-09-01">="2026-10-01").toBe(false);});
});
