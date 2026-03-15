"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.salutation) newErrors.salutation = "Salutation is required.";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.preferredContactMethod) {
      newErrors.preferredContactMethod = "Preferred contact method is required.";
    }
    if (!formData.contactIdentifier.trim()) {
      newErrors.contactIdentifier = "Contact identifier is required.";
    }
    if (!formData.memberType) {
      newErrors.memberType = "Member type is required.";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    console.log("Profile form submitted:", formData);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="salutation">Salutation</Label>
          <select
            id="salutation"
            name="salutation"
            value={formData.salutation}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select salutation</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>
          {errors.salutation && <p className="text-sm text-red-500 mt-1">{errors.salutation}</p>}
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
          {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
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
          {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
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
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-Binary">Non-Binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender}</p>}
        </div>

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
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
          <select
            id="preferredContactMethod"
            name="preferredContactMethod"
            value={formData.preferredContactMethod}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select contact method</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="Discord">Discord</option>
            <option value="LinkedIn">LinkedIn</option>
          </select>
          {errors.preferredContactMethod && (
            <p className="text-sm text-red-500 mt-1">{errors.preferredContactMethod}</p>
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
            <p className="text-sm text-red-500 mt-1">{errors.contactIdentifier}</p>
          )}
        </div>

        <div>
          <Label htmlFor="memberType">Member Type</Label>
          <select
            id="memberType"
            name="memberType"
            value={formData.memberType}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
          >
            <option value="">Select member type</option>
            <option value="Free">Free</option>
            <option value="Paid">Paid</option>
          </select>
          {errors.memberType && <p className="text-sm text-red-500 mt-1">{errors.memberType}</p>}
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

        <Button type="submit">Save Profile</Button>
      </form>
    </main>
  );
}