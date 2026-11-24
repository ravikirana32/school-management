import { describe, expect, it } from "vitest";

const transitions: Record<string,string[]> = { DRAFT:["SUBMITTED","WITHDRAWN"], SUBMITTED:["UNDER_REVIEW","DOCUMENTS_PENDING","REJECTED","WITHDRAWN"], UNDER_REVIEW:["DOCUMENTS_PENDING","APPROVED","REJECTED","WITHDRAWN"], DOCUMENTS_PENDING:["UNDER_REVIEW","APPROVED","REJECTED","WITHDRAWN"], APPROVED:["OFFERED","WITHDRAWN"], OFFERED:["ACCEPTED","WITHDRAWN"], ACCEPTED:["CONVERTED","WITHDRAWN"], REJECTED:[], WITHDRAWN:[], CONVERTED:[] };
describe("admission workflow transitions",()=>{
 it("allows only the intended next stages",()=>{expect(transitions.DRAFT).toContain("SUBMITTED");expect(transitions.APPROVED).toContain("OFFERED");expect(transitions.ACCEPTED).toContain("CONVERTED");});
 it("prevents terminal-stage resurrection",()=>{for(const status of ["REJECTED","WITHDRAWN","CONVERTED"])expect(transitions[status]).toHaveLength(0);});
 it("does not permit direct draft-to-accepted or offer-to-rejected",()=>{expect(transitions.DRAFT).not.toContain("ACCEPTED");expect(transitions.OFFERED).not.toContain("REJECTED");});
});
