import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { SavedJobsList } from "@/components/dashboard/saved-jobs-list";
import { getSavedJobs } from "@/lib/dashboard/queries";

export default async function DashboardSavedPage() {
  const jobs = await getSavedJobs();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Saved opportunities"
        description="Opportunities you saved from the browse experience."
        action={{ href: "/opportunities", label: "Browse more" }}
      />
      <SavedJobsList jobs={jobs} />
    </div>
  );
}
