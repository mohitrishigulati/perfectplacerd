import { SettingsPanel } from "@/components/dashboard/settings-panel";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Privacy controls, data export, and account deletion.
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}
