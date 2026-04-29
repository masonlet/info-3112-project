import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, apiError } from "@/lib/auth/route-guards";

type RatePayload = {
  targetUserId?: string;
  rating?: number;
};

export async function GET() {
  const auth = await requireAuth({ paid: true, notPM: true });
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.supabase
    .from("match_feedback")
    .select("target_user_id, rating")
    .eq("rater_user_id", auth.user.id);

  if (error) {
    console.error("[ERROR] Ratings Feedback Fetch:", error);
    return apiError("Failed to load your match ratings.", 500);
  }

  const ratings = Object.fromEntries(
    (data ?? []).map(
      (row) => [row.target_user_id as string, row.rating as number]
    )
  );

  return NextResponse.json({ ratings });
}

export async function POST(req: Request) {
  const auth = await requireAuth({ paid: true, notPM: true });
  if (!auth.ok) return auth.response;

  const body = (await req.json()) as RatePayload;
  const targetUserId = body.targetUserId?.trim();
  const rating = body.rating;

  if (!targetUserId) return apiError("targetUserId is required.", 400);
  if (targetUserId === auth.user.id) return apiError("You cannot rate yourself.", 400);
  
  if (!Number.isInteger(rating) || rating! < 1 || rating! > 5)
    return apiError("rating must be an integer between 1 and 5.", 400);

  const admin = createAdminClient();
  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError) {
    console.error("[ERROR] Ratings Target Lookup:", targetError);
    return apiError("Failed to look up match. Please try again.", 500);
  }
  if (!targetProfile) return apiError("The selected match could not be found.", 404);

  const { data: exposures, error: exposureError } = await auth.supabase
    .from("contact_info_exposures")
    .select("owner_user_id")
    .eq("viewer_user_id", auth.user.id)
    .eq("owner_user_id", targetUserId)
    .limit(1);

  if (exposureError) {
    console.error("[ERROR] Ratings Exposures Lookup:", exposureError);
    return apiError("Failed to verify contact info request. Please try again.", 500);
  }
  if (!exposures || exposures.length === 0) 
    return apiError("Request contact info before rating this match.", 403);

  const { error: upsertError } = await auth.supabase.from("match_feedback").upsert(
    {
      rater_user_id: auth.user.id,
      target_user_id: targetUserId,
      rating,
    },
    { onConflict: "rater_user_id,target_user_id", }
  );

  if (upsertError) {
    console.error("[ERROR] Ratings Feedback Upsert:", upsertError);
    return apiError("Unable to save your rating right now.", 500);
  }

  return NextResponse.json({ success: true });
}
