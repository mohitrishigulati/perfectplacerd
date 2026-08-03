import Link from "next/link";
import type { OpportunityListItem } from "@/lib/opportunities/queries";
import {
  EXPERIENCE_LABELS,
  WORK_MODE_LABELS,
} from "@/lib/opportunities/apply";

function formatSalary(item: OpportunityListItem): string | null {
  if (item.salary_min == null && item.salary_max == null) {
    return null;
  }
  const currency = item.salary_currency || "USD";
  if (item.salary_min != null && item.salary_max != null) {
    return `${currency} ${item.salary_min.toLocaleString()}–${item.salary_max.toLocaleString()}`;
  }
  if (item.salary_min != null) {
    return `From ${currency} ${item.salary_min.toLocaleString()}`;
  }
  return `Up to ${currency} ${item.salary_max!.toLocaleString()}`;
}

export function OpportunityCard({ opportunity }: { opportunity: OpportunityListItem }) {
  const salary = formatSalary(opportunity);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        <Link
          href={`/opportunities/${opportunity.slug}`}
          className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:focus-visible:outline-zinc-100"
        >
          {opportunity.title}
        </Link>
      </h2>

      <ul className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-400" role="list">
        {opportunity.location && (
          <li className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
            {opportunity.location}
          </li>
        )}
        {opportunity.work_mode && (
          <li className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
            {WORK_MODE_LABELS[opportunity.work_mode]}
          </li>
        )}
        {opportunity.experience_level && (
          <li className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
            {EXPERIENCE_LABELS[opportunity.experience_level]}
          </li>
        )}
        {opportunity.industry && (
          <li className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
            {opportunity.industry}
          </li>
        )}
        {opportunity.employment_type && (
          <li className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
            {opportunity.employment_type}
          </li>
        )}
      </ul>

      {salary && (
        <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {salary}
        </p>
      )}

      <Link
        href={`/opportunities/${opportunity.slug}`}
        className="mt-4 inline-flex text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
      >
        View opportunity
      </Link>
    </article>
  );
}
