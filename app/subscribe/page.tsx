"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SubscribeResponse = {
  success?: boolean;
  is_paid?: boolean;
  error?: string;
};

export default function SubscribePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState("");

  const handleFakePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
      });

      const data = (await res.json()) as SubscribeResponse;

      if (!res.ok) {
        setError(data.error ?? "Subscription failed. Please try again.");
        return;
      }

      if (data.success && data.is_paid) {
        setIsPaid(true);
        return;
      }

      setError("Subscription failed. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Membership Subscription</CardTitle>
          <p className="text-sm text-muted-foreground">
            Unlock full access with a monthly plan.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isPaid ? (
            <>
              <div className="rounded-md border bg-muted/40 px-4 py-3">
                <p className="text-sm">Plan: Monthly Premium</p>
                <p className="text-xs text-muted-foreground mt-1">Demo payment flow (mock only)</p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button onClick={handleFakePayment} className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Pay with Google"}
              </Button>

              <Button variant="outline" className="w-full" onClick={() => router.push("/profile")}>
                Back to Profile
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
                <p className="text-sm text-green-700 font-medium">Payment successful</p>
                <p className="text-sm text-green-700">Your account is now set to Paid.</p>
              </div>

              <Button asChild className="w-full">
                <Link href="/profile">Go to Profile</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
