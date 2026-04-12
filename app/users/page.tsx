import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPMType } from "@/lib/roles";
import { getAllUsers } from "@/lib/dashboard";
import { UsersTable } from "@/components/users/UsersTable";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, member_type")
    .eq("user_id", user.id)
    .single();

  if (!isPMType(profile?.member_type ?? "", profile?.role ?? "")) redirect ("/");

  const isDemo = profile?.member_type === "Product Manager";
  const users = await getAllUsers(supabase);

  return (
    <div className="flex-1 py-10 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} {users.length === 1 ? "user" : "users"}
            </p>
          </div>
          {isDemo && (
            <span className="text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-full px-3 py-1">
              Demo Mode
            </span>
          )}
        </div>

        <UsersTable
          users={users}
          isDemo={isDemo}
          currentUserId={user.id}
          currentUserRole={profile?.role ?? "member"}
        />
      </div>
    </div>
  );
}
