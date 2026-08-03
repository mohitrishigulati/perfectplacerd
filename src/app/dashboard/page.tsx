import { ProfileCompletionCard } from "@/components/dashboard/profile-completion-card";
import {
  DashboardQuickActions,
  DashboardStatCards,
  DashboardWelcomeBanner,
} from "@/components/dashboard/dashboard-home-sections";
import {
  DashboardRecentApplications,
  DashboardRecentSaved,
} from "@/components/dashboard/dashboard-recent-lists";
import { getDashboardOverview } from "@/lib/dashboard/queries";

export const metadata = {
  title: "Overview | Dashboard | Perfect Placer",
};

export default async function DashboardHomePage() {
  const overview = await getDashboardOverview();

  return (
    <div className="space-y-8">
      <DashboardWelcomeBanner overview={overview} />

      <DashboardStatCards stats={overview.stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardRecentApplications
          applications={overview.recentApplications}
        />
        <DashboardRecentSaved jobs={overview.recentSaved} />
      </div>

      <ProfileCompletionCard completion={overview.completion} />

      <DashboardQuickActions />
    </div>
  );
}
