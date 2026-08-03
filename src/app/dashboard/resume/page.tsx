import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ResumeUploader } from "@/components/dashboard/resume-uploader";
import { getPrimaryResume } from "@/lib/dashboard/queries";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardResumePage() {
  const user = await requireUser("/dashboard/resume");
  const resume = await getPrimaryResume();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Resume"
        description="Keep a private primary resume on file. Uploading a new file replaces the previous one."
        action={{ href: "/dashboard/profile", label: "Edit profile" }}
      />
      <ResumeUploader userId={user.id} resume={resume} />
    </div>
  );
}
