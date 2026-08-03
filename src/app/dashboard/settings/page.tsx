import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { getDashboardProfile } from "@/lib/dashboard/queries";

export default async function DashboardSettingsPage() {
  const profile = await getDashboardProfile();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Settings"
        description="Account details, notifications, privacy controls, and data export."
        action={{ href: "/dashboard", label: "Back to overview" }}
      />
      <SettingsPanel
        email={profile.email}
        notifyApplicationStatus={profile.notify_application_status}
      />
    </div>
  );
}
