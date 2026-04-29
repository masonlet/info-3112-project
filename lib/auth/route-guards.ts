import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isPMType } from "@/lib/roles";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export function apiError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type RequireAuthOptions = {
  paid?: boolean;
  notPM?: boolean;
};

type RequireAuthSuccess = {
  ok: true;
  supabase: SupabaseClient;
  user: User;
  profile: { member_type?: string; role?: string };
};

type RequireAuthFailure = {
  ok: false;
  response: NextResponse;
};

export async function requireAuth(
  options: RequireAuthOptions = {},
): Promise<RequireAuthSuccess | RequireAuthFailure> {
  const { paid = false, notPM = false } = options;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) console.error("[ERROR] requireAuth Auth:", userError);
  if (userError || !user) return {
    ok: false,
    response: apiError("You must be logged in.", 401)
  };

  const needsProfile = paid || notPM;
  if (!needsProfile) return { ok: true, supabase, user, profile: {}};

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("member_type, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[ERROR] requireAuth Profile Fetch:", profileError);
    return {
      ok: false,
      response: apiError("Failed to load your profile. Please try again.", 500)
    };
  }

  if (!profile) return {
    ok: false,
    response: apiError("Complete your profile before continuing.", 400)
  };

  if (paid && profile.member_type === "Free") return {
    ok: false,
    response: apiError("Upgrade to a paid membership to continue.", 403)
  };

  if (notPM && isPMType(profile.role ?? "")) return {
    ok: false,
    response: apiError("Product managers cannot perform this action.", 403)
  };

  return { ok: true, supabase, user, profile };
}
