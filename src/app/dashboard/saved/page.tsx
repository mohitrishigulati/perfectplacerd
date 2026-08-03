import { SavedJobsList } from "@/components/dashboard/saved-jobs-list";
import { getSavedJobs } from "@/lib/dashboard/queries";

export default async function DashboardSavedPage() {
  const jobs = await getSavedJobs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved opportunities</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Opportunities you saved from the browse experience.
        </p>
      </div>
      <SavedJobsList jobs={jobs} />
    </div>
  );
}
