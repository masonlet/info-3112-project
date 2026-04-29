import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPMType } from "@/lib/roles";

type RatePayload = {
  targetUserId?: string;
  rating?: number;
};

async function getAuthorizedPaidUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return {
    supabase,
    error: NextResponse.json(
      { error: "You must be logged in to rate matches." },
      { status: 401 }
    ),
    user: null,
    profile: null,
  };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("member_type, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[ERROR] Ratings Profile Fetch:", profileError);
    return {
      supabase,
      error: NextResponse.json(
        { error: "Failed to load your profile. Please try again." },
        { status: 500 }
      ),
      user: null,
      profile: null,
    };
  }

  if (!profile) return {
    supabase,
    error: NextResponse.json(
      { error: "Complete your profile before rating matches." },
      { status: 400 }
    ),
    user: null,
    profile: null,
  };

  if (profile.member_type === "Free") return {
    supabase,
    error: NextResponse.json(
      { error: "Upgrade to a paid membership to rate matches." },
      { status: 403 }
    ),
    user: null,
    profile,
  };

  if (isPMType(profile.member_type ?? "", profile.role ?? "")) return {
    supabase,
    error: NextResponse.json(
      { error: "Product managers cannot rate matches." },
      { status: 403 }
    ),
    user: null,
    profile,
  };

  return {
    supabase,
    error: null,
    user,
    profile
  };
}

export async function GET() {
  const auth = await getAuthorizedPaidUser();
  if (auth.error || !auth.user) return auth.error!;

  const { data, error } = await auth.supabase
    .from("match_feedback")
    .select("target_user_id, rating")
    .eq("rater_user_id", auth.user.id);

  if (error) {
    console.error("[ERROR] Ratings Feedback Fetch:", error);
    return NextResponse.json(
      { error: "Failed to load your match ratings." },
      { status: 500 }
    );
  }

  const ratings = Object.fromEntries(
    (data ?? []).map(
      (row) => [row.target_user_id as string, row.rating as number]
    )
  );

  return NextResponse.json({ ratings });
}

export async function POST(req: Request) {
  const auth = await getAuthorizedPaidUser();
  if (auth.error || !auth.user) return auth.error!;

  const body = (await req.json()) as RatePayload;
  const targetUserId = body.targetUserId?.trim();
  const rating = body.rating;

  if (!targetUserId) return NextResponse.json(
    { error: "targetUserId is required." },
    { status: 400 }
  );

  if (targetUserId === auth.user.id) return NextResponse.json(
    { error: "You cannot rate yourself." },
    { status: 400 }
  );

  if (!Number.isInteger(rating) || rating! < 1 || rating! > 5) return NextResponse.json(
    { error: "rating must be an integer between 1 and 5." },
    { status: 400 }
  );

  const admin = createAdminClient();
  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (targetError) {
    console.error("[ERROR] Ratings Target Lookup:", targetError);
    return NextResponse.json(
      { error: "Failed to look up match. Please try again." },
      { status: 500 }
    );
  }

  if (!targetProfile) return NextResponse.json(
    { error: "The selected match could not be found." },
    { status: 404 }
  );

  const { data: exposures, error: exposureError } = await auth.supabase
    .from("contact_info_exposures")
    .select("owner_user_id")
    .eq("viewer_user_id", auth.user.id)
    .eq("owner_user_id", targetUserId)
    .limit(1);

  if (exposureError) {
    console.error("[ERROR] Ratings Exposures Lookup:", exposureError);
    return NextResponse.json(
      { error: "Failed to verify contact info request. Please try again." },
      { status: 500 }
    );
  }

  if (!exposures || exposures.length === 0) return NextResponse.json(
    { error: "Request contact info before rating this match." },
    { status: 403 }
  );

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
    return NextResponse.json(
      { error: "Unable to save your rating right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
