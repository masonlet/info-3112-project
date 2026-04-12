import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPMType } from "@/lib/roles";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/register");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, member_type")
    .eq("user_id", user.id)
    .single();

  if (isPMType(profile?.member_type ?? "", profile?.role ?? ""))
    redirect("/dashboard");

  redirect("/matches");
}
