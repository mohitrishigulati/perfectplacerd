import Link from "next/link";
import { AdminJobForm } from "@/components/admin/admin-job-form";

export default function AdminNewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/jobs" className="text-sm text-zinc-600 underline dark:text-zinc-400">
          ← All opportunities
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">New opportunity</h1>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <AdminJobForm mode="create" />
      </div>
    </div>
  );
}
