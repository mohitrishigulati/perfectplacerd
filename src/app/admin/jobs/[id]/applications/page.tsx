import Link from "next/link";
import { AdminApplicationsPanel } from "@/components/admin/admin-applications-panel";
import { getAdminJobApplications } from "@/lib/admin/queries";
import { JOB_STATUS_LABELS } from "@/lib/admin/jobs";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminJobApplicationsPage({ params }: PageProps) {
  const { id } = await params;
  const { job, applications } = await getAdminJobApplications(id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/jobs/${job.id}/edit`} className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← Edit opportunity
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Applicants</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {job.title} · {JOB_STATUS_LABELS[job.status]} · {applications.length} applicant
          {applications.length === 1 ? "" : "s"}
        </p>
      </div>
      <AdminApplicationsPanel jobId={job.id} applications={applications} />
    </div>
  );
}
