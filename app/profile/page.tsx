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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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