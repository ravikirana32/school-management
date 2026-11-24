import { describe, expect, it } from "vitest";
import { hasPermission } from "./permissions.js";

describe("permission matching",()=>{
 it("accepts exact permissions",()=>expect(hasPermission({userId:"u",permissions:new Set(["staff.read"])}, "staff.read")).toBe(true));
 it("accepts module wildcard only within that module",()=>{const c={userId:"u",permissions:new Set(["staff.*"])};expect(hasPermission(c,"staff.update")).toBe(true);expect(hasPermission(c,"students.read")).toBe(false);});
 it("accepts explicit global wildcard and platform admin",()=>{expect(hasPermission({userId:"u",permissions:new Set(["*"])},"fees.manage")).toBe(true);expect(hasPermission({userId:"u",permissions:new Set(),isPlatformAdmin:true},"fees.manage")).toBe(true);});
 it("denies absent permissions by default",()=>expect(hasPermission({userId:"u",permissions:new Set()},"students.read")).toBe(false));
});
