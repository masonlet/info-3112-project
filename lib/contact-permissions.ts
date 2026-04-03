type MemberType = "Free" | "Paid" | "Staff";

export type ContactVisibilityDecision = {
  allowed: boolean;
  reason:
    | "viewer_not_permitted"
    | "owner_not_opted_in"
    | "owner_missing_contact_details"
    | "allowed";
};

type ContactPermissionInput = {
  viewerMemberType: MemberType;
  ownerShowContactInfo: boolean;
  ownerPreferredContactMethod: string | null;
  ownerContactIdentifier: string | null;
};

export function getDefaultContactVisibility(): boolean {
  // Option A policy: visibility is opt-in for everyone.
  return false;
}

export function decideContactVisibility(
  input: ContactPermissionInput
): ContactVisibilityDecision {
  if (input.viewerMemberType !== "Paid" && input.viewerMemberType !== "Staff") {
    return { allowed: false, reason: "viewer_not_permitted" };
  }

  if (!input.ownerShowContactInfo) {
    return { allowed: false, reason: "owner_not_opted_in" };
  }

  if (!input.ownerPreferredContactMethod || !input.ownerContactIdentifier?.trim()) {
    return { allowed: false, reason: "owner_missing_contact_details" };
  }

  return { allowed: true, reason: "allowed" };
}
