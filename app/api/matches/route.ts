import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculateCompatibilityScore,
  calculateAge,
  getZodiacSign,
  type Profile,
  type Match,
} from "@/lib/matching";
import { isPMType } from "@/lib/roles";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json(
    { error: "You must be logged in to view matches." },
    { status: 401 }
  );

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name, nickname, gender, date_of_birth, member_type, photo_url, preferred_contact_method, skills, desired_skills, desired_gender, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("[ERROR] Matches Profile Fetch:", profileError);
    return NextResponse.json(
      { error: "Failed to load your profile. Please try again." },
      { status: 500 }
    );
  }
  if (!currentProfile) return NextResponse.json(
    { error: "Please complete your profile before viewing matches." },
    { status: 400 }
  );

  if (currentProfile.member_type === "Free") return NextResponse.json(
    { error: "Upgrade to a paid membership to view matches." },
    { status: 403 }
  );
  if (isPMType(currentProfile.role ?? "")) return NextResponse.json(
    { error: "Product managers cannot view matches." },
    { status: 403 }
  );
  
  const admin = createAdminClient();

  let query = admin
    .from("profiles")
    .select("user_id, first_name, last_name, nickname, gender, date_of_birth, member_type, photo_url, preferred_contact_method, skills, desired_skills, desired_gender, role")
    .eq("member_type", "Paid")
    .eq("role", "member")
    .neq("user_id", user.id);

  if (currentProfile.desired_gender && currentProfile.desired_gender !== "No Preference")
    query = query.eq("gender", currentProfile.desired_gender);

  const { data: candidates, error: candidatesError } = await query;
  if (candidatesError) {
    console.error("[ERROR] Matches Candidates Query:", candidatesError);
    return NextResponse.json(
      { error: "Failed to load match recommendations. Please try again." },
      { status: 500 }
    );
  }

  const scoredMatches: Match[] = (candidates ?? [])
    .map((candidate: Profile): Match => ({
      user_id: candidate.user_id,
      first_name: candidate.first_name,
      last_name: candidate.last_name,
      nickname: candidate.nickname,
      gender: candidate.gender,
      member_type: candidate.member_type,
      photo_url: candidate.photo_url,
      preferred_contact_method: candidate.preferred_contact_method,
      skills: candidate.skills,
      desired_skills: candidate.desired_skills,
      desired_gender: candidate.desired_gender,
      age: calculateAge(candidate.date_of_birth),
      zodiac_sign: getZodiacSign(candidate.date_of_birth),
      score: calculateCompatibilityScore(currentProfile, candidate),
    }))
    .sort((a, b) => b.score - a.score);

  const safeCurrentProfile: Match = {
    user_id: currentProfile.user_id,
    first_name: currentProfile.first_name,
    last_name: currentProfile.last_name,
    nickname: currentProfile.nickname,
    gender: currentProfile.gender,
    member_type: currentProfile.member_type,
    photo_url: currentProfile.photo_url,
    preferred_contact_method: currentProfile.preferred_contact_method,
    skills: currentProfile.skills,
    desired_skills: currentProfile.desired_skills,
    desired_gender: currentProfile.desired_gender,
    age: calculateAge(currentProfile.date_of_birth),
    zodiac_sign: getZodiacSign(currentProfile.date_of_birth),
    score: 0,
  };

  return NextResponse.json({ matches: scoredMatches, currentProfile: safeCurrentProfile });
}
