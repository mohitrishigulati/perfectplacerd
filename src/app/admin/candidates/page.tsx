import { AdminCandidatesTable } from "@/components/admin/admin-candidates-table";
import { getAdminCandidates } from "@/lib/admin/queries";

export default async function AdminCandidatesPage() {
  const candidates = await getAdminCandidates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          View candidate profiles and download primary resumes using time-limited signed URLs.
        </p>
      </div>
      <AdminCandidatesTable candidates={candidates} />
    </div>
  );
}
