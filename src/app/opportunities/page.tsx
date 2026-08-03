import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import {
  OpportunityFiltersForm,
  OpportunityPagination,
} from "@/components/opportunities/opportunity-filters";
import { parseOpportunityFilters } from "@/lib/opportunities/filters";
import {
  getOpportunityFacets,
  searchOpportunities,
} from "@/lib/opportunities/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Opportunities | Perfect Placer",
  description: "Browse and apply to published opportunities.",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseOpportunityFilters(params);

  let result = {
    items: [] as Awaited<ReturnType<typeof searchOpportunities>>["items"],
    total: 0,
    page: filters.page,
    pageSize: 12,
    totalPages: 1,
  };
  let facets = { locations: [] as string[], industries: [] as string[] };
  let loadError: string | null = null;

  try {
    [result, facets] = await Promise.all([
      searchOpportunities(filters),
      getOpportunityFacets(),
    ]);
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Could not load opportunities.";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Opportunities
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Discover published roles, filter by what matters to you, and apply with
          your current resume when you&apos;re ready.
        </p>
        {loadError && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            Live listings are unavailable ({loadError}). Filters and layout can
            still be verified; configure Supabase for full data.
          </p>
        )}
      </div>

      <OpportunityFiltersForm filters={filters} facets={facets} />

      <section aria-labelledby="results-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="results-heading" className="text-lg font-semibold">
            Results
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {result.total} opportunit{result.total === 1 ? "y" : "ies"} found
          </p>
        </div>

        {result.items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-300 p-8 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            {loadError
              ? "No opportunities loaded."
              : "No opportunities match your filters. Try clearing filters or broadening your search."}
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2" role="list">
            {result.items.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityCard opportunity={opportunity} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <OpportunityPagination
            filters={filters}
            page={result.page}
            totalPages={result.totalPages}
          />
        </div>
      </section>
    </div>
  );
}
