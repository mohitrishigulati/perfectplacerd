import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminJobForm } from "@/components/admin/admin-job-form";
import { AdminJobStatusActions } from "@/components/admin/admin-job-status-actions";
import { getAdminJobById } from "@/lib/admin/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditJobPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getAdminJobById(id);
  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/jobs" className="text-sm text-zinc-600 underline dark:text-zinc-400">
            ← All opportunities
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Edit opportunity</h1>
        </div>
        <Link href={`/admin/jobs/${job.id}/applications`} className="btn-secondary">
          View applicants
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <AdminJobForm mode="edit" job={job} />
        </div>
        <AdminJobStatusActions jobId={job.id} status={job.status} />
      </div>
    </div>
  );
}
