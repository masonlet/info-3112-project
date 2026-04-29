export const MEMBER_TYPES = ["Free", "Paid"] as const;
export type MemberType = typeof MEMBER_TYPES[number];

export const SUBSCRIBE_PLANS = ["Free", "Paid", "DemoProductManager"] as const;
export type SubscribePlan = typeof SUBSCRIBE_PLANS[number];

export function isPMType(role: string): boolean {
  return role === "demo_product_manager" ||
         role === "product_manager" || 
         role === "owner";
}

