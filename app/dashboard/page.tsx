import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, member_type, first_name")
    .eq("user_id", user.id)
    .single();

  const isRealPM = profile?.role === "product_manager" || profile?.role === "owner";
  const isDemo = profile?.member_type === "Product Manager";

  if (!isRealPM && !isDemo) redirect("/");

  const stats = await getDashboardStats(supabase);

  return (
    <div className="flex-1 py-10 px-4 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Management Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isDemo
                ? ""
                : `Welcome back, ${profile?.first_name}.`}
            </p>
          </div>
          {isDemo && (
            <span className="text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full px-3 py-1">
              Demo Mode
            </span>
          )}
          {profile?.role === "owner" && (
            <span className="text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300 rounded-full px-3 py-1">
              Owner
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Free Members" value={stats.freeMembers} />
          <StatCard title="Paid Members" value={stats.paidMembers} />
          <StatCard title="Contact Info Exposures" value={stats.exposures} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
