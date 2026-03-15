import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Profile</h1>

      <form className="flex flex-col gap-4">
        <div>
          <Label>First Name</Label>
          <Input placeholder="First name" />
        </div>

        <div>
          <Label>Last Name</Label>
          <Input placeholder="Last name" />
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" placeholder="Email address" />
        </div>

        <Button type="submit">Save Profile</Button>
      </form>
    </main>
  );
}