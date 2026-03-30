"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useFormFields } from "@/hooks/useFormFields";
import { validateEmail } from "@/lib/auth-validation";
import { getFriendlyError } from "@/lib/auth-errors";

const supabase = createClient();

export default function EmailCard() {
  const { formData, setFormData, errors, setErrors, handleChange } = useFormFields({ email: "" });
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentEmail(user?.email ?? null);
    });
  }, []);

  const handleEmailChange = async () => {
    setEmailSuccess(false);
    const emailErr = validateEmail(formData.email);
    if (emailErr) return setErrors({ email: emailErr });

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: formData.email.toLowerCase().trim() });
      if (error) setErrors({ email: getFriendlyError(error.message) });
      else {
        setEmailSuccess(true);
        setFormData({ email: "" });
      }
    } catch {
      setErrors({ email: "Something went wrong. Please try again." });
    }
    setEmailLoading(false);
  };

  const handleEmailFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSuccess(false);
    handleChange(e);
  };

  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          {currentEmail && (
            <Label className="mb-2 block">Current email: <span className="font-normal">{currentEmail}</span></Label>
          )}
          <Label htmlFor="email">New Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="new@example.com"
            value={formData.email}
            onChange={handleEmailFieldChange}
            onBlur={() => {
              const emailErr = validateEmail(formData.email);
              if (emailErr) setErrors({ email: emailErr });
            }}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        {emailSuccess && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm text-green-600">Check both your old and new email to confirm the change.</p>
          </div>
        )}
        <Button
          className="w-full"
          onClick={handleEmailChange}
          disabled={emailLoading || !formData.email || formData.email === currentEmail}
        >
          {emailLoading ? "Updating..." : "Update Email"}
        </Button>
      </CardContent>
    </Card>
  );
}
