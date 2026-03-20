"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFields } from "@/lib/hooks/useFormFields";
import { validateEmail } from "@/lib/auth-validation";
import { getFriendlyError } from "@/lib/auth-errors";

type LoginFormData = {
  email: string;
  password: string;
}
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const { 
    formData,
    errors, setErrors,
    handleChange 
  } = useFormFields<LoginFormData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    if (!formData.password) newErrors.password = "Password is required.";
    return newErrors;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ 
      email: formData.email.toLowerCase().trim(), 
      password: formData.password
    });
    if (error) setErrors({ form: getFriendlyError(error.message) });
    else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <p className="text-sm text-muted-foreground">Welcome back to LookingForLove</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                placeholder="******" 
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
                value={formData.password} 
                onChange={handleChange}
              />
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1 text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>
            {errors.form && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
