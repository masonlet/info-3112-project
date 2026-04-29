"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type SubscribePlan } from "@/lib/roles";
import { useUser } from "@/lib/context/user-context";

type MembershipResponse = {
  success?: boolean;
  error?: string;
};

const plans: { plan: SubscribePlan; label: string; description: string }[] = [
  {
    plan: "Free",
    label: "Free",
    description: "Basic access to the platform."
  },
  {
    plan: "Paid",
    label: "Paid",
    description: "Full access to the platform."
  },
  { 
    plan: "DemoProductManager",
    label: "Product Manager",
    description: "Access to the platform management tools. (DEMONSTRATION ONLY)"
  }
];

export default function MembershipPage() {
  const supabase = useMemo(() => createClient(), []);
  const [currentPlan, setCurrentPlan] = useState<SubscribePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<SubscribePlan | null>(null);
  const [pendingPaidPlan, setPendingPaidPlan] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { refresh } = useUser();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("member_type, role")
        .eq("user_id", user.id)
        .maybeSingle();

      const derived: SubscribePlan =
        data?.role === "demo_product_manager"
          ? "DemoProductManager"
          : ((data?.member_type as "Free" | "Paid") ?? "Free");
      setCurrentPlan(derived);
      setLoading(false);
    };
    load();
  }, [supabase]);

  const switchPlan = async (plan: SubscribePlan) => {
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
      const planLabel = plans.find(p => p.plan === plan)?.label ?? plan;
      setSuccess(`Switched to ${planLabel}.`);
      await refresh();
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
      await refresh();
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
              <div key={plan}>
                <div className={`rounded-md border px-4 py-3 flex items-center justify-between gap-4 ${isActive ? "bg-muted/60 border-primary" : "bg-background"}`}>
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
                {plan === "Paid" && pendingPaidPlan && (
                  <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-3">
                    <p className="text-sm font-medium">Complete Payment</p>
                    <p className="text-xs text-muted-foreground">Demo payment flow (mock only)</p>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleFakePayment}
                        disabled={submitting === "Paid"}
                      >
                        {submitting ? "Processing..." : "Pay with Google"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPendingPaidPlan(false)}
                        disabled={submitting === "Paid"}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
