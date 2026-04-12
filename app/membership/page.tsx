"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Plan = "Free" | "Paid";

type MembershipResponse = {
  success?: boolean;
  member_type?: string;
  error?: string;
};

const plans: { plan: Plan; label: string; description: string }[] = [
  { plan: "Free", label: "Free", description: "Basic access to the platform." },
  { plan: "Paid", label: "Paid", description: "Full access to the platform." },
];

export default function MembershipPage() {
  const supabase = useMemo(() => createClient(), []);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Plan | null>(null);
  const [pendingPaidPlan, setPendingPaidPlan] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("member_type")
        .eq("user_id", user.id)
        .maybeSingle();
      setCurrentPlan((data?.member_type as Plan) ?? "Free");
      setLoading(false);
    };
    load();
  }, [supabase]);

  const switchPlan = async (plan: Plan) => {
    setError("");
    setSuccess("");
    setSubmitting(plan);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await res.json()) as MembershipResponse;
      if (!res.ok) {
        setError(data.error ?? "Failed. Please try again.");
        return;
      }

      setCurrentPlan(plan);
      setSuccess(`Switched to ${plan}.`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleFakePayment = async () => {
    setSubmitting("Paid");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "Paid" }),
      });

      const data = (await res.json()) as MembershipResponse;
      if (!res.ok) { 
        setError(data.error ?? "Subscription failed. Please try again."); 
        return; 
      }

      setCurrentPlan("Paid");
      setPendingPaidPlan(false);
      setSuccess("Payment successful. You are now a Paid member.");
    } catch {
      setError("Something went wrong. Please try again.");
      setPendingPaidPlan(false);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 bg-muted/30">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Membership</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a plan.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {plans.map(({ plan, label, description }) => {
            const isActive = currentPlan === plan;
            return (
              <div key={plan} className={`rounded-md border px-4 py-3 flex items-center justify-between gap-4 ${isActive ? "bg-muted/60 border-primary" : "bg-background"}`}>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                {isActive ? (
                  <span className="text-xs font-medium text-muted-foreground">Current</span>
                ) : (
                  <Button
                    size="sm"
                    disabled={!!submitting || loading}
                    onClick={() => {
                      if (plan === "Paid") {
                        setSuccess("");
                        setPendingPaidPlan(true);
                      } else {
                        switchPlan(plan);
                      }
                    }}
                  > {submitting === plan ? "Switching..." : "Select"}
                  </Button>
                )}
              </div>
            );
          })}

          {pendingPaidPlan && (
            <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-3">
              <p className="text-sm font-medium">Complete Payment</p>
              <p className="text-xs text-muted-foreground">Demo payment flow (mock only)</p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleFakePayment} disabled={submitting === "Paid"}>
                  {submitting ? "Processing..." : "Pay with Google"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setPendingPaidPlan(false)} disabled={submitting === "Paid"}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
