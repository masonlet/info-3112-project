import EmailCard from "@/components/settings/EmailCard";
import PasswordCard from "@/components/settings/PasswordCard";
import DangerZoneCard from "@/components/settings/DangerZoneCard";

export default function Settings() {
  return (
    <div className="flex flex-col flex-1 items-center px-4 py-12 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account</p>
        </div>
        <EmailCard/>
        <PasswordCard/>
        <DangerZoneCard/>
      </div>
    </div>
  );
}
