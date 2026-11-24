export function parentPortalAccessAllowed(input:{membershipActive:boolean;organizationMembershipActive:boolean;parentRoleAssigned:boolean;permissionGranted:boolean;verifiedGuardian:boolean;acceptedInvitation:boolean;consentAccepted:boolean;visibleStudentLink:boolean}):boolean {
  return input.membershipActive && input.organizationMembershipActive && input.parentRoleAssigned && input.permissionGranted && input.verifiedGuardian && input.acceptedInvitation && input.consentAccepted && input.visibleStudentLink;
}
export function parentStudentLinkVisible(input:{guardianInvitationAccepted:boolean;guardianActive:boolean;communicationAllowed:boolean}):boolean {
  return input.guardianInvitationAccepted && input.guardianActive && input.communicationAllowed;
}
