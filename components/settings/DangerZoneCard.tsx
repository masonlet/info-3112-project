"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function DangerZoneCard() {
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      setSignOutError("Failed to sign out. Please try again.");
      setSignOutLoading(false);
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
        <Button variant="destructive" className="w-full">Delete Account</Button>
      </CardContent>
    </Card>
  );
}
