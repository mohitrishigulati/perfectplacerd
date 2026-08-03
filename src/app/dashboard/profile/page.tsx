import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ProfileEditorForm } from "@/components/dashboard/profile-editor-form";
import {
  getDashboardProfile,
  getPrimaryResume,
} from "@/lib/dashboard/queries";

export default async function DashboardProfilePage() {
  const [profile, resume] = await Promise.all([
    getDashboardProfile(),
    getPrimaryResume(),
  ]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Profile"
        description="Update your details, skills, preferences, and choose who can see your profile."
        action={{ href: "/dashboard", label: "Back to overview" }}
      />
      <ProfileEditorForm profile={profile} hasPrimaryResume={Boolean(resume)} />
    </div>
  );
}
