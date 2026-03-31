import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateCompatibilityScore, type Profile, type Match } from "@/lib/matching";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to view matches." },
      { status: 401 }
    );
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !currentProfile) {
    return NextResponse.json(
      { error: "Please complete your profile before viewing matches." },
      { status: 400 }
    );
  }

  const hasPaidAccess = Boolean(currentProfile.is_paid) || currentProfile.member_type === "Paid";

  if (!hasPaidAccess) {
    return NextResponse.json(
      { error: "Upgrade to a paid membership to view matches." },
      { status: 403 }
    );
  }

  const { data: candidates, error: candidatesError } = await supabase
    .from("profiles")
    .select("*")
    .or("is_paid.eq.true,member_type.eq.Paid")
    .neq("user_id", user.id);

  if (candidatesError) {
    return NextResponse.json(
      { error: "Failed to load match recommendations. Please try again." },
      { status: 500 }
    );
  }

  const scoredMatches: Match[] = (candidates ?? [])
    .map((candidate: Profile) => ({
      ...candidate,
      score: calculateCompatibilityScore(currentProfile, candidate),
    }))
    .sort((a: Match, b: Match) => b.score - a.score);

  return NextResponse.json({ matches: scoredMatches, currentProfile });
}