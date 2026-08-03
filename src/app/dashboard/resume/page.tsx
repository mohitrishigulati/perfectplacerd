import { ResumeUploader } from "@/components/dashboard/resume-uploader";
import { getPrimaryResume } from "@/lib/dashboard/queries";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardResumePage() {
  const user = await requireUser("/dashboard/resume");
  const resume = await getPrimaryResume();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resume</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Keep a private primary resume on file. Uploading a new file replaces
          the previous one.
        </p>
      </div>
      <ResumeUploader userId={user.id} resume={resume} />
    </div>
  );
}
