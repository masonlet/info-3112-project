"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="flex flex-col flex-1 items-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>

        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">New Email</Label>
              <Input id="email" name="email" placeholder="new@example.com"/>
            </div>
            <Button className="w-full">Update Email</Button>
          </CardContent>
        </Card>

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
        <Card className="shadow-lg border border-red-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="destructive" className="w-full">Sign Out</Button>
            <Button variant="destructive" className="w-full">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
