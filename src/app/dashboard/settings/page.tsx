import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Settings"
        description="Privacy controls, data export, and account deletion."
        action={{ href: "/dashboard", label: "Back to overview" }}
      />
      <SettingsPanel />
    </div>
  );
}
