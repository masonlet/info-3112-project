"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAge } from "@/lib/matching";

type UserRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  gender: string;
  desired_gender: string | null;
  member_type: string;
  role?: string | null;
  date_of_birth: string;
  preferred_contact_method: string;
  skills: string[];
  desired_skills: string[];
  photo_url: string | null;
};

const DEMO = "(DEMO)";

export function UsersTable({
  users,
  isDemo,
  currentUserId,
  currentUserRole,
}: {
  users: UserRow[];
  isDemo: boolean;
  currentUserId: string;
  currentUserRole: string;
}) {
  const disabledTitle = isDemo ? "Disabled in demo mode" : undefined;
  const isOwner = currentUserRole === "owner";

  function canManage(row: UserRow) {
    if (row.user_id === currentUserId) return false;
    if (row.role === "owner") return false;
    if (row.role === "product_manager") return isOwner;
    return true;
  }

  return (
    <div className="rounded-md border bg-background overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Gender</th>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Skills</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id} className="border-t">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {u.photo_url ? (
                    <img
                      src={u.photo_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground border">
                      {u.first_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{u.first_name} {u.last_name}</p>
                    {u.nickname && <p className="text-xs text-muted-foreground">&quot;{u.nickname}&quot;</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {isDemo ? DEMO : u.date_of_birth ? calculateAge(u.date_of_birth) : "—"}
              </td>
              <td className="px-4 py-3">{u.gender ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge variant="outline">{u.member_type ?? "—"}</Badge>
              </td>
              <td className="px-4 py-3">{u.role ?? "—"}</td>
              <td className="px-4 py-3">
                {isDemo ? DEMO : u.preferred_contact_method}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {u.skills?.slice(0, 3).map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                  {(u.skills?.length ?? 0) > 3 && (
                    <span className="text-xs text-muted-foreground">+{u.skills!.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
              {canManage(u) ? (
                <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" disabled={isDemo} title={disabledTitle}>Edit</Button>
                <Button size="sm" variant="outline" disabled={isDemo} title={disabledTitle}>Role</Button>
                <Button size="sm" variant="outline" disabled={isDemo} title={disabledTitle}>Plan</Button>
                <Button size="sm" variant="outline" disabled={isDemo} title={disabledTitle} className="text-red-600 hover:text-red-700">Delete</Button>
                </div>
              ) : (
              <span className="text-xs text-muted-foreground">—</span>
              )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
