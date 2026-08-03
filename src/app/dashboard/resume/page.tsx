import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ResumeSuggestionsReview } from "@/components/dashboard/resume-suggestions-review";
import { ResumeUploader } from "@/components/dashboard/resume-uploader";
import { getDashboardProfile, getPrimaryResume } from "@/lib/dashboard/queries";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardResumePage() {
  const user = await requireUser("/dashboard/resume");
  const [resume, profile] = await Promise.all([
    getPrimaryResume(),
    getDashboardProfile(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Resume"
        description="Upload a private primary resume. Review suggested profile fields before applying them."
        action={{ href: "/dashboard/profile", label: "Edit profile" }}
      />
      <ResumeUploader userId={user.id} resume={resume} />
      {resume ? <ResumeSuggestionsReview resume={resume} profile={profile} /> : null}
    </div>
  );
}
