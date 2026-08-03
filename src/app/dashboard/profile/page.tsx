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
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Update your details, skills, preferences, and choose who can see your
          profile.
        </p>
      </div>
      <ProfileEditorForm profile={profile} hasPrimaryResume={Boolean(resume)} />
    </div>
  );
}
