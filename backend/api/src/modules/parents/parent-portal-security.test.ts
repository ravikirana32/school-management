import { describe, expect, it } from "vitest";
import { parentPortalAccessAllowed, parentStudentLinkVisible } from "./parent-portal-security.js";

describe("parent portal authorization gates",()=>{
  const allowed={membershipActive:true,organizationMembershipActive:true,parentRoleAssigned:true,permissionGranted:true,verifiedGuardian:true,acceptedInvitation:true,consentAccepted:true,visibleStudentLink:true};
  it("allows access only when every independent authorization condition is true",()=>{
    expect(parentPortalAccessAllowed(allowed)).toBe(true);
    for(const key of Object.keys(allowed) as (keyof typeof allowed)[]) expect(parentPortalAccessAllowed({...allowed,[key]:false})).toBe(false);
  });
  it("does not expose a student link without accepted invitation, active guardian and communications consent",()=>{
    expect(parentStudentLinkVisible({guardianInvitationAccepted:true,guardianActive:true,communicationAllowed:true})).toBe(true);
    expect(parentStudentLinkVisible({guardianInvitationAccepted:false,guardianActive:true,communicationAllowed:true})).toBe(false);
    expect(parentStudentLinkVisible({guardianInvitationAccepted:true,guardianActive:false,communicationAllowed:true})).toBe(false);
    expect(parentStudentLinkVisible({guardianInvitationAccepted:true,guardianActive:true,communicationAllowed:false})).toBe(false);
  });
});
