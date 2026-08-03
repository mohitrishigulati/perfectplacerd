import Link from "next/link";
import {
  buildOpportunityQueryString,
  EXPERIENCE_LEVELS,
  type OpportunityFilters,
  WORK_MODES,
} from "@/lib/opportunities/filters";
import {
  EXPERIENCE_LABELS,
  WORK_MODE_LABELS,
} from "@/lib/opportunities/apply";
import type { OpportunityFacets } from "@/lib/opportunities/queries";

type Props = {
  filters: OpportunityFilters;
  facets: OpportunityFacets;
};

export function OpportunityFiltersForm({ filters, facets }: Props) {
  return (
    <form
      method="get"
      action="/opportunities"
      className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-950"
      aria-label="Filter opportunities"
    >
      <div className="sm:col-span-2 lg:col-span-3">
        <label htmlFor="q" className="text-sm font-medium">
          Keyword search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q ?? ""}
          placeholder="Search titles, descriptions, industries…"
          className="field-input mt-1"
        />
      </div>

      <div>
        <label htmlFor="location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="location"
          name="location"
          list="location-options"
          defaultValue={filters.location ?? ""}
          className="field-input mt-1"
          placeholder="City or region"
        />
        <datalist id="location-options">
          {facets.locations.map((location) => (
            <option key={location} value={location} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="experience" className="text-sm font-medium">
          Experience
        </label>
        <select
          id="experience"
          name="experience"
          defaultValue={filters.experience ?? ""}
          className="field-input mt-1"
        >
          <option value="">Any experience</option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {EXPERIENCE_LABELS[level]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="industry" className="text-sm font-medium">
          Industry
        </label>
        <input
          id="industry"
          name="industry"
          list="industry-options"
          defaultValue={filters.industry ?? ""}
          className="field-input mt-1"
          placeholder="Industry"
        />
        <datalist id="industry-options">
          {facets.industries.map((industry) => (
            <option key={industry} value={industry} />
          ))}
        </datalist>
      </div>

      <div>
        <label htmlFor="workMode" className="text-sm font-medium">
          Work mode
        </label>
        <select
          id="workMode"
          name="workMode"
          defaultValue={filters.workMode ?? ""}
          className="field-input mt-1"
        >
          <option value="">Any work mode</option>
          {WORK_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {WORK_MODE_LABELS[mode]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
        <button type="submit" className="btn-primary">
          Apply filters
        </button>
        <Link
          href="/opportunities"
          className="btn-secondary"
        >
          Clear filters
        </Link>
      </div>
    </form>
  );
}

export function OpportunityPagination({
  filters,
  page,
  totalPages,
}: {
  filters: OpportunityFilters;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const prevHref =
    page > 1
      ? `/opportunities${buildOpportunityQueryString(filters, { page: page - 1 })}`
      : null;
  const nextHref =
    page < totalPages
      ? `/opportunities${buildOpportunityQueryString(filters, { page: page + 1 })}`
      : null;

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3"
      aria-label="Opportunities pagination"
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Link href={prevHref} className="btn-secondary">
            Previous
          </Link>
        ) : (
          <span className="btn-secondary pointer-events-none opacity-50" aria-disabled="true">
            Previous
          </span>
        )}
        {nextHref ? (
          <Link href={nextHref} className="btn-secondary">
            Next
          </Link>
        ) : (
          <span className="btn-secondary pointer-events-none opacity-50" aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
