import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPMType } from "@/lib/roles";

export async function requirePM() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, member_type, first_name")
    .eq("user_id", user.id)
    .single();

  if (!isPMType(profile?.role ?? ""))
    redirect("/");

  return {
    user,
    profile: profile!,
    isDemo: profile?.role === "demo_product_manager",
  };
}
