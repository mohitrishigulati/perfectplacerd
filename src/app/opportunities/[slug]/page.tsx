import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityActions } from "@/components/opportunities/opportunity-actions";
import {
  APPLICATION_STATUS_LABELS,
  EXPERIENCE_LABELS,
  WORK_MODE_LABELS,
} from "@/lib/opportunities/apply";
import {
  getOpportunityBySlug,
  getViewerOpportunityState,
} from "@/lib/opportunities/queries";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) {
    return { title: "Opportunity not found | Perfect Placer" };
  }
  return {
    title: `${opportunity.title} | Opportunities | Perfect Placer`,
    description: opportunity.description.slice(0, 160),
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);
  if (!opportunity) {
    notFound();
  }

  const user = await getSessionUser();
  const viewerState = await getViewerOpportunityState(opportunity.id, user?.id ?? null);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0">
        <Link
          href="/opportunities"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
        >
          ← All opportunities
        </Link>

        <header className="mt-4">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {opportunity.title}
          </h1>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-600 dark:text-zinc-400" role="list">
            {opportunity.location && <li>{opportunity.location}</li>}
            {opportunity.work_mode && (
              <li>{WORK_MODE_LABELS[opportunity.work_mode]}</li>
            )}
            {opportunity.experience_level && (
              <li>{EXPERIENCE_LABELS[opportunity.experience_level]}</li>
            )}
            {opportunity.industry && <li>{opportunity.industry}</li>}
            {opportunity.employment_type && <li>{opportunity.employment_type}</li>}
          </ul>
        </header>

        {viewerState.application && (
          <p className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm dark:bg-zinc-900" role="status">
            Your application is{" "}
            <strong>{APPLICATION_STATUS_LABELS[viewerState.application.status]}</strong>.
          </p>
        )}

        <div className="prose prose-zinc mt-6 max-w-none dark:prose-invert">
          <h2 className="text-lg font-semibold">About this opportunity</h2>
          <div className="whitespace-pre-wrap text-base leading-7 text-zinc-700 dark:text-zinc-300">
            {opportunity.description}
          </div>
        </div>
      </article>

      <aside className="space-y-4">
        <OpportunityActions
          jobId={opportunity.id}
          slug={opportunity.slug}
          isAuthenticated={Boolean(user)}
          viewerState={viewerState}
        />
      </aside>
    </div>
  );
}
