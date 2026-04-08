"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormFields } from "@/hooks/useFormFields";
import {
  validateContactVisibility,
  validateEmail,
} from "@/lib/auth-validation";
import { getDefaultContactVisibility } from "@/lib/contact-permissions";

type ProfileFormData = {
  salutation: string;
  firstName: string;
  lastName: string;
  nickname: string;
  dateOfBirth: string;
  gender: string;
  photoUrl: string;

  email: string;
  phone: string;
  discord: string;
  linkedin: string;
  preferredContactMethod: string;
  showContactInfo: boolean;
  
  desiredGender: string;
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
    photoUrl: "",

    email: "",
    phone: "",
    discord: "",
    linkedin: "",
    preferredContactMethod: "",
    showContactInfo: getDefaultContactVisibility(),
    
    desiredGender: "",
  });

  const supabase = useMemo(() => createClient(), []);
  const [submittedProfile, setSubmittedProfile] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [desiredSkillInput, setDesiredSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.salutation) newErrors.salutation = "Salutation is required.";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";

    if (formData.email.trim()) {
      const emailErr = validateEmail(formData.email);
      if (emailErr) newErrors.email = emailErr;
    }

    if (formData.preferredContactMethod === "Email" && !formData.email.trim())
      newErrors.email = "Email is required when it is the preferred contact method.";

    if (formData.preferredContactMethod === "Phone" && !formData.phone.trim())
      newErrors.phone = "Phone number is required when it is the preferred contact method.";

    if (formData.preferredContactMethod === "Discord" && !formData.discord.trim())
      newErrors.discord = "Discord username is required when it is the preferred contact method.";

    if (formData.preferredContactMethod === "LinkedIn" && !formData.linkedin.trim())
      newErrors.linkedin = "LinkedIn profile is required when it is the preferred contact method.";

    const contactVisibilityError = validateContactVisibility(
      formData.showContactInfo,
      formData.preferredContactMethod,
    );

    if (contactVisibilityError)
      newErrors.preferredContactMethod = contactVisibilityError;

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
        photoUrl: data.photo_url ?? "",

        email: data.email ?? "",
        phone: data.phone ?? "",
        discord: data.discord ?? "",
        linkedin: data.linkedin ?? "",
        preferredContactMethod: data.preferred_contact_method ?? "",
        showContactInfo: data.show_contact_info ?? getDefaultContactVisibility(),

        desiredGender: data.desired_gender ?? "",
      };

      setFormData(loadedProfile);
      setSubmittedProfile(loadedProfile);
      setSkills(data.skills ?? []);
      setDesiredSkills(data.desired_skills ?? []);
      setHasExistingProfile(true);
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

      if (Object.keys(validationErrors).length > 0) {
        const firstErrorField = Object.keys(validationErrors)[0];
        const element = document.querySelector(`[name="${firstErrorField}"]`);

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        return;
      }

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
      photo_url: formData.photoUrl || null,
      skills,

      email: formData.email,
      phone: formData.phone || null,
      discord: formData.discord || null,
      linkedin: formData.linkedin || null,
      preferred_contact_method: formData.preferredContactMethod,
      show_contact_info: formData.showContactInfo,

      desired_gender: formData.desiredGender,
      desired_skills: desiredSkills,

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

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    const normalized = trimmed.toLowerCase();
    const exists = skills.some((skill) => skill.toLowerCase() === normalized);

    if (exists) {
      setSkillInput("");
      return;
    }

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    setSkills([...skills, formatted]);
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleAddDesiredSkill = () => {
    const trimmed = desiredSkillInput.trim();
    if (!trimmed) return;

    const normalized = trimmed.toLowerCase();
    const exists = desiredSkills.some(
      (skill) => skill.toLowerCase() === normalized
    );

    if (exists) {
      setDesiredSkillInput("");
      return;
    }

    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    setDesiredSkills([...desiredSkills, formatted]);
    setDesiredSkillInput("");
  };

  const handleRemoveDesiredSkill = (skillToRemove: string) => {
    setDesiredSkills(desiredSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (skillInput.trim()) {
        handleAddSkill();
      } else {
        const form = e.currentTarget.closest("form");
        form?.requestSubmit();
      }
    }
  };

  const handleDesiredSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (desiredSkillInput.trim()) {
        handleAddDesiredSkill();
      } else {
        const form = e.currentTarget.closest("form");
        form?.requestSubmit();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 py-10 px-4 bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </CardContent>
          </Card>
        </div>
      </div>
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
                  <SummaryItem
                    label="Photo URL"
                    value={submittedProfile.photoUrl || "Not provided"}
                  />
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-medium mb-2">My Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No skills added.</p>
                    ) : (
                      skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                          {skill}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Contact Information</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SummaryItem
                    label="Email"
                    value={submittedProfile.email || "Not provided"}
                  />
                  <SummaryItem
                    label="Phone"
                    value={submittedProfile.phone || "Not provided"}
                  />
                  <SummaryItem
                    label="Discord"
                    value={submittedProfile.discord || "Not provided"}
                  />
                  <SummaryItem
                    label="LinkedIn"
                    value={submittedProfile.linkedin || "Not provided"}
                  />
                  <SummaryItem
                    label="Preferred Contact Method"
                    value={submittedProfile.preferredContactMethod || "Not provided"}
                  />
                  <SummaryItem
                    label="Contact Visibility"
                    value={submittedProfile.showContactInfo ? "Visible to eligible members" : "Hidden"}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Desired Partner</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <SummaryItem
                    label="Desired Gender"
                    value={submittedProfile.desiredGender || "Not provided"}
                  />
                </div>

                <div className="pt-2">
                  <h3 className="text-base font-medium mb-2">Desired Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {desiredSkills.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No desired skills added.
                      </p>
                    ) : (
                      desiredSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                          {skill}
                        </Badge>
                      ))
                    )}
                  </div>
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
            <CardTitle className="text-2xl font-bold">
              {hasExistingProfile ? "Edit Your Profile" : "Create Your Profile"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your personal and contact information to build your member
              profile.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">

              {/* PERSONAL INFORMATION */}
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

                <div className="pt-4 space-y-3">
                  <h3 className="text-base font-medium">My Skills</h3>

                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Enter a skill"
                    />
                    <Button type="button" onClick={handleAddSkill}>
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skills.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No skills added yet.</p>
                    ) : (
                      skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="flex items-center gap-2 px-3 py-1 text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </section>

              {/* CONTACT INFORMATION */}
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="discord">Discord Username</Label>
                  <Input
                    id="discord"
                    name="discord"
                    placeholder="Enter Discord username"
                    value={formData.discord}
                    onChange={handleChange}
                  />
                  {errors.discord && (
                    <p className="mt-1 text-sm text-red-500">{errors.discord}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    placeholder="Enter LinkedIn profile URL"
                    value={formData.linkedin}
                    onChange={handleChange}
                  />
                  {errors.linkedin && (
                    <p className="mt-1 text-sm text-red-500">{errors.linkedin}</p>
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

                <div className="rounded-md border bg-background px-3 py-3">
                  <label htmlFor="showContactInfo" className="flex items-start gap-3 text-sm">
                    <input
                      id="showContactInfo"
                      name="showContactInfo"
                      type="checkbox"
                      checked={formData.showContactInfo}
                      onChange={handleChange}
                      className="mt-0.5 h-4 w-4"
                    />
                    <span>
                      Allow eligible members to request and view my contact identifier.
                    </span>
                  </label>
                </div>
              </section>

              {/* DESIRED PARTNER */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">Desired Partner</h2>

                <div>
                  <Label htmlFor="desiredGender">Desired Gender</Label>
                  <select
                    id="desiredGender"
                    name="desiredGender"
                    value={formData.desiredGender}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select desired gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="No Preference">No Preference</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-medium">Desired Skills</h3>

                  <div className="flex gap-2">
                    <Input
                      value={desiredSkillInput}
                      onChange={(e) => setDesiredSkillInput(e.target.value)}
                      onKeyDown={handleDesiredSkillKeyDown}
                      placeholder="Enter a desired skill"
                    />
                    <Button type="button" onClick={handleAddDesiredSkill}>
                      Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {desiredSkills.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No desired skills added yet.
                      </p>
                    ) : (
                      desiredSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="flex items-center gap-2 px-3 py-1 text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDesiredSkill(skill)}
                            className="text-red-500 hover:text-red-700"
                          >
                            x
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
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

