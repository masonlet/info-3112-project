import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getAllUsers() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to load users.");
  return data ?? [];
}

export async function getDashboardStats() {
  const admin = createAdminClient();

  const [
    { count: freeCount }, 
    { count: paidCount }, 
    { count: exposureCount }
  ] = await Promise.all([
    admin.from("profiles")
         .select("*", { count: "exact", head: true })
         .eq("member_type", "Free"),
    admin.from("profiles")
         .select("*", { count: "exact", head: true })
         .eq("member_type", "Paid"),
    admin.from("contact_info_exposures")
         .select("*", { count: "exact", head: true }),
  ]);

  return {
    freeMembers: freeCount ?? 0,
    paidMembers: paidCount ?? 0,
    exposures: exposureCount ?? 0,
  };
}

