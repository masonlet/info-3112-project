"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFields } from "@/hooks/useFormFields";
import { validateEmail } from "@/lib/auth-validation";

type ProfileFormData = {
  salutation: string;
  firstName: string;
  lastName: string;
  nickname: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  preferredContactMethod: string;
  contactIdentifier: string;
  memberType: string;
  photoUrl: string;
};

export default function ProfilePage() {
  const {
    formData, setFormData,
    errors, setErrors,
    handleChange
  } = useFormFields<ProfileFormData>({
    salutation: "",
    firstName: "",
    lastName: "",
    nickname: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    preferredContactMethod: "",
    contactIdentifier: "",
    memberType: "",
    photoUrl: "",
  });

  const supabase = createClient();
  const [submittedProfile, setSubmittedProfile] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.salutation) newErrors.salutation = "Salutation is required.";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    if (!formData.preferredContactMethod)
      newErrors.preferredContactMethod = "Preferred contact method is required.";

    if (!formData.contactIdentifier.trim())
      newErrors.contactIdentifier = "Contact identifier is required.";

    if (!formData.memberType)
      newErrors.memberType = "Member type is required.";

    return newErrors;
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      const loadedProfile: ProfileFormData = {
        salutation: data.salutation ?? "",
        firstName: data.first_name ?? "",
        lastName: data.last_name ?? "",
        nickname: data.nickname ?? "",
        dateOfBirth: data.date_of_birth ?? "",
        gender: data.gender ?? "",
        email: data.email ?? "",
        preferredContactMethod: data.preferred_contact_method ?? "",
        contactIdentifier: data.contact_identifier ?? "",
        memberType: data.member_type ?? "",
        photoUrl: data.photo_url ?? "",
      };

      setFormData(loadedProfile);
      setSubmittedProfile(loadedProfile);
    }

    setLoading(false);
  }, [supabase, setFormData]);

  useEffect(() => {
      loadProfile();
    }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaveMessage("You must be logged in to save your profile.");
      return;
    }

    const profilePayload = {
      user_id: user.id,
      salutation: formData.salutation,
      first_name: formData.firstName,
      last_name: formData.lastName,
      nickname: formData.nickname || null,
      date_of_birth: formData.dateOfBirth,
      gender: formData.gender,
      email: formData.email,
      preferred_contact_method: formData.preferredContactMethod,
      contact_identifier: formData.contactIdentifier,
      member_type: formData.memberType,
      photo_url: formData.photoUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "user_id" });

    if (error) {
      setSaveMessage("Failed to save profile.");
      console.error(error);
      return;
    }

    setSaveMessage("Profile saved successfully.");
    setSubmittedProfile(formData);
  };

  const handleEditProfile = () => {
    setSubmittedProfile(null);
    setSaveMessage("");
  };

    if (loading) {
    return (
      <main className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (submittedProfile) {
    return (
      <div className="flex-1 py-10 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Profile Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review the information you entered for your profile.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SummaryItem label="Salutation" value={submittedProfile.salutation} />
                  <SummaryItem label="First Name" value={submittedProfile.firstName} />
                  <SummaryItem label="Last Name" value={submittedProfile.lastName} />
                  <SummaryItem
                    label="Nickname"
                    value={submittedProfile.nickname || "Not provided"}
                  />
                  <SummaryItem label="Date of Birth" value={submittedProfile.dateOfBirth} />
                  <SummaryItem label="Gender" value={submittedProfile.gender} />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Contact Information</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SummaryItem label="Email" value={submittedProfile.email} />
                  <SummaryItem
                    label="Preferred Contact Method"
                    value={submittedProfile.preferredContactMethod}
                  />
                  <SummaryItem
                    label="Contact Identifier"
                    value={submittedProfile.contactIdentifier}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Membership Details</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SummaryItem label="Member Type" value={submittedProfile.memberType} />
                  <SummaryItem
                    label="Photo URL"
                    value={submittedProfile.photoUrl || "Not provided"}
                  />
                </div>
              </section>

              <Button onClick={handleEditProfile} className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-10 bg-muted/30">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Your Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your personal and contact information to build your member
              profile.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Personal Information</h2>

                <div>
                  <Label htmlFor="salutation">Salutation</Label>
                  <select
                    id="salutation"
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select salutation</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                  {errors.salutation && (
                    <p className="mt-1 text-sm text-red-500">{errors.salutation}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    placeholder="Nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Contact Information</h2>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="preferredContactMethod">
                    Preferred Contact Method
                  </Label>
                  <select
                    id="preferredContactMethod"
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select contact method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Discord">Discord</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                  {errors.preferredContactMethod && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.preferredContactMethod}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactIdentifier">Contact Identifier</Label>
                  <Input
                    id="contactIdentifier"
                    name="contactIdentifier"
                    placeholder="Enter your contact details"
                    value={formData.contactIdentifier}
                    onChange={handleChange}
                  />
                  {errors.contactIdentifier && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.contactIdentifier}
                    </p>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Membership Details</h2>

                <div>
                  <Label htmlFor="memberType">Member Type</Label>
                  <select
                    id="memberType"
                    name="memberType"
                    value={formData.memberType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select member type</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                  </select>
                  {errors.memberType && (
                    <p className="mt-1 text-sm text-red-500">{errors.memberType}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
                  <Input
                    id="photoUrl"
                    name="photoUrl"
                    placeholder="Paste photo URL"
                    value={formData.photoUrl}
                    onChange={handleChange}
                  />
                </div>
              </section>

              {saveMessage && (
                <p className="text-sm text-muted-foreground">{saveMessage}</p>
              )}

              <Button type="submit" className="mt-2 w-full">
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

