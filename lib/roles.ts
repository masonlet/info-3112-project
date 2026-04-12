export const MEMBER_TYPES = ["Free", "Paid", "Product Manager"] as const;
export type MemberType = typeof MEMBER_TYPES[number];

export function isValidPlan(plan: string): plan is MemberType {
  return (MEMBER_TYPES as readonly string[]).includes(plan);
}

export function isPMType(memberType: string, role: string): boolean {
  return memberType === "Product Manager"
      || role === "product_manager"
      || role === "owner";
}

