import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isValidPlan } from "@/lib/roles";

export async function POST(req: Request) {
  const supabase = await createClient();
  const updatedAt = new Date().toISOString();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to subscribe." },
      { status: 401 }
    );
  }

  const { plan } = (await req.json()) as { plan: string };
  if (!plan || !isValidPlan(plan)) return NextResponse.json(
    { error: "Plan is missing or invalid." },
    { status: 400 }
  );

  const { data: updated, error: subscribeError } = await supabase
    .from("profiles")
    .update({
      member_type: plan,
      updated_at: updatedAt,
    })
    .eq("user_id", user.id)
    .select("user_id");

  if (subscribeError) {
    console.error("Subscribe error:", subscribeError);
    return NextResponse.json(
      { error: `Failed to update membership status: ${subscribeError.message}` },
      { status: 500 }
    );
  }

  if (!updated || updated.length === 0) return NextResponse.json(
    { error: "Complete your profile before subscribing." },
    { status: 400 }
  );

  return NextResponse.json({
    success: true,
    member_type: plan,
  });
}
