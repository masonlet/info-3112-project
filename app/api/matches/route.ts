import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateCompatibilityScore, type Profile, type Match } from "@/lib/matching";
import { isPMType } from "@/lib/roles";

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
    .select("user_id, first_name, last_name, nickname, gender, date_of_birth, member_type, photo_url, preferred_contact_method, skills, desired_skills, desired_gender, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !currentProfile) {
    return NextResponse.json(
      { error: "Please complete your profile before viewing matches." },
      { status: 400 }
    );
  }

  if (currentProfile.member_type === "Free") {
    return NextResponse.json(
      { error: "Upgrade to a paid membership to view matches." },
      { status: 403 }
    );
  }

  if (isPMType(currentProfile.member_type ?? "", currentProfile.role ?? "")) {
    return NextResponse.json(
      { error: "Product managers cannot view matches." },
      { status: 403 }
    );
  }

  let query = supabase
    .from("profiles")
    .select("user_id, first_name, last_name, nickname, gender, date_of_birth, member_type, photo_url, preferred_contact_method, skills, desired_skills, desired_gender, role")
    .or("member_type.eq.Paid")
    .neq("user_id", user.id);

  if (currentProfile.desired_gender && currentProfile.desired_gender !== "No Preference") {
    query = query.eq("gender", currentProfile.desired_gender);
  }

  const { data: candidates, error: candidatesError } = await query;

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
