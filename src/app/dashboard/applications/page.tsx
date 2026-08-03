import { ApplicationsList } from "@/components/dashboard/applications-list";
import { getCandidateApplications } from "@/lib/dashboard/queries";

export default async function DashboardApplicationsPage() {
  const applications = await getCandidateApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Track roles you&apos;ve applied to and their current status.
        </p>
      </div>
      <ApplicationsList applications={applications} />
    </div>
  );
}
