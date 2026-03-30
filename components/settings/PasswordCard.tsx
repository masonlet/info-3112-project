"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PasswordCard() {
  return (
    <Card className="shadow-lg border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" name="currentPassword" type="password" placeholder="******"/>
        </div>
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input id="password" name="password" type="password" placeholder="******"/>
        </div>
        <Button className="w-full">Update Password</Button>
      </CardContent>
    </Card>
  );
}
