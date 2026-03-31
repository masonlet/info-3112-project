"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useFormFields } from "@/hooks/useFormFields";
import { validatePassword } from "@/lib/auth-validation";
import { getFriendlyError } from "@/lib/auth-errors";

const supabase = createClient();

type Step = "form" | "otp";

export default function PasswordCard() {
  const {
    formData, setFormData,
    errors, setErrors,
    handleChange
  } = useFormFields({
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const [step, setStep] = useState<Step>("form");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordSuccess(false);
    handleChange(e);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setPasswordSuccess(false);
    const newErrors: Record<string, string> = {};
    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords don't match.";
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.reauthenticate();
      if (error) setErrors({ form: getFriendlyError(error.message) });
      else setStep("otp");
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.otp) return setErrors({ otp: "Verification code is required." });

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
        nonce: formData.otp,
      });
      if (error) setErrors({ form: getFriendlyError(error.message) });
      else {
        setPasswordSuccess(true);
        setFormData({ password: "", confirmPassword: "", otp: "" });
        setStep("form");
      }
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Security</CardTitle>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={step === "form" ? handleSendCode : handlePasswordUpdate} 
          className="space-y-4"
        >
          {step === "form" && (
            <>
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={handlePasswordFieldChange}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                />
                {errors.password && (
                  <p id="password-error" role="alert" className="mt-1 text-sm text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="******"
                  value={formData.confirmPassword}
                  onChange={handlePasswordFieldChange}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirmPassword-error"
                />
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" role="alert" className="mt-1 text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={passwordLoading || !formData.password || !formData.confirmPassword}
              >
                {passwordLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enter the code sent to your email.
                </p>
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  placeholder="123456"
                  value={formData.otp}
                  onChange={handleChange}
                  aria-invalid={!!errors.otp}
                  aria-describedby="otp-error"
                  autoFocus
                />
                {errors.otp && (
                  <p id="otp-error" role="alert" className="mt-1 text-sm text-red-500">
                    {errors.otp}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={passwordLoading || !formData.otp}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep("form");
                    setErrors({});
                    setFormData({ password: "", confirmPassword: "", otp: "" });
                  }}
                  disabled={passwordLoading}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {errors.form && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}
          {passwordSuccess && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
              <p className="text-sm text-green-600">Password updated successfully.</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
