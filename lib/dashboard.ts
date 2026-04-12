import "server-only";
import type { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const [
    { count: freeCount }, 
    { count: paidCount }, 
    { count: exposureCount }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("member_type", "Free"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("member_type", "Paid"),
    supabase
      .from("contact_info_exposures")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    freeMembers: freeCount ?? 0,
    paidMembers: paidCount ?? 0,
    exposures: exposureCount ?? 0,
  };
}

