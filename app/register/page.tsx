"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFields } from "@/lib/hooks/useFormFields";
import { validateEmail, validatePassword } from "@/lib/auth-validation";
import { getFriendlyError } from "@/lib/auth-errors";

type RegisterFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

function RegisterForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const { 
    formData, setFormData, 
    errors, setErrors,
    handleChange 
  } = useFormFields<RegisterFormData>({
    email: "", 
    password: "", 
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) setErrors({ form: message });
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match.";

    return newErrors;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email: formData.email.toLowerCase().trim(), 
      password: formData.password 
    });
    if (error) setErrors({ form: getFriendlyError(error.message) });
    else {
      setFormData({ email: "", password: "", confirmPassword: "" });
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-lg border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-600">Success!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Check your email to confirm signup. If you already have an account, try logging in.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
          <p className="text-sm text-muted-foreground">Join LookingForLove Today</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Account Details</h2>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  name="email"
                  id="email" 
                  type="email" 
                  aria-invalid={!!errors.email}
                  aria-describedby="email-error"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  name="password"
                  id="password" 
                  type="password" 
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                  placeholder="**********"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  name="confirmPassword"
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirmPassword-error"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </section>

            {errors.form && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600">{errors.form}</p>
              </div>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm/>
    </Suspense>
  );
}
