import { ApplicationsList } from "@/components/dashboard/applications-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getCandidateApplications } from "@/lib/dashboard/queries";

export default async function DashboardApplicationsPage() {
  const applications = await getCandidateApplications();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Applications"
        description="Track roles you've applied to and their current status."
        action={{ href: "/opportunities", label: "Browse opportunities" }}
      />
      <ApplicationsList
        key={applications
          .map((application) => `${application.id}:${application.status}`)
          .join("|")}
        applications={applications}
      />
    </div>
  );
}
