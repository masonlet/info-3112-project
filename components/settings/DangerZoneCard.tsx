"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { getFriendlyError } from "@/lib/auth-errors";

const supabase = createClient();

export default function DangerZoneCard() {
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setSignOutError(null);
    setSignOutLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      setSignOutError("Failed to sign out. Please try again.");
      setSignOutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/delete-account", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(getFriendlyError(data.error));
        setDeleteLoading(false);
      } else {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setDeleteLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border border-red-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-red-600">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {signOutError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{signOutError}</p>
          </div>
        )}
        <Button variant="destructive" className="w-full" onClick={handleSignOut} disabled={signOutLoading}>
          {signOutLoading ? "Signing out..." : "Sign Out"}
        </Button>
        {deleteError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{deleteError}</p>
          </div>
        )}
        <Button variant="destructive" className="w-full" onClick={handleDeleteAccount} disabled={deleteLoading}>
          {deleteLoading ? "Deleting..." : "Delete Account"}
        </Button>
      </CardContent>
    </Card>
  );
}
