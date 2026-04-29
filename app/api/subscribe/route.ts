import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUBSCRIBE_PLANS, type SubscribePlan } from "@/lib/roles";

export async function POST(req: Request) {
  const supabase = await createClient();
  const updatedAt = new Date().toISOString();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) console.error("[ERROR] Subscribe Auth:", userError);
  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to subscribe." },
      { status: 401 }
    );
  }

  const { plan } = (await req.json()) as { plan: SubscribePlan };
  if (!plan || !SUBSCRIBE_PLANS.includes(plan)) return NextResponse.json(
    { error: "Plan is missing or invalid." },
    { status: 400 }
  );

  const updates =
  plan === "DemoProductManager"
    ? { role: "demo_product_manager", member_type: "Free", updated_at: updatedAt }
    : { role: "member", member_type: plan, updated_at: updatedAt };

  const { data: updated, error: subscribeError } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id)
    .select("user_id");

  if (subscribeError) {
    console.error("[ERROR] Subscribe Update:", subscribeError);
    return NextResponse.json(
      { error: "Failed to update membership. Please try again." },
      { status: 500 }
    );
  }

  if (!updated || updated.length === 0) return NextResponse.json(
    { error: "Complete your profile before subscribing." },
    { status: 400 }
  );

  return NextResponse.json({ success: true });
}
