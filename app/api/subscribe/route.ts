import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const updatedAt = new Date().toISOString();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to subscribe." },
      { status: 401 }
    );
  }

  const { error: subscribeError } = await supabase
    .from("profiles")
    .update({
      is_paid: true,
      member_type: "Paid",
      updated_at: updatedAt,
    })
    .eq("user_id", user.id);

  if (subscribeError) {
    console.error("Subscribe error:", subscribeError);
    return NextResponse.json(
      { error: `Failed to update membership status: ${subscribeError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    is_paid: true,
    member_type: "Paid",
  });
}