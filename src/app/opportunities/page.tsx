import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import {
  OpportunityFiltersForm,
  OpportunityPagination,
} from "@/components/opportunities/opportunity-filters";
import { parseOpportunityFilters } from "@/lib/opportunities/filters";
import { loadOpportunitiesPage } from "@/lib/opportunities/load-page";
import { createPublicMetadata } from "@/lib/site/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPublicMetadata({
  title: "Leadership Opportunities",
  description:
    "Browse published executive and leadership opportunities from Perfect Placer across India.",
  path: "/opportunities",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseOpportunityFilters(params);
  const load = await loadOpportunitiesPage(filters);
  const { result, facets } = load;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--pp-navy)]">
          Opportunities
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-600">
          Discover published leadership roles, filter by what matters to you, and
          apply with your profile when you&apos;re ready.
        </p>
        {load.status === "unavailable" && (
          <p
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
            role="status"
          >
            {load.message}
          </p>
        )}
      </div>

      <OpportunityFiltersForm filters={filters} facets={facets} />

      <section aria-labelledby="results-heading">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="results-heading" className="text-lg font-semibold text-[var(--pp-navy)]">
            Results
          </h2>
          <p className="text-sm text-zinc-600">
            {result.total} opportunit{result.total === 1 ? "y" : "ies"} found
          </p>
        </div>

        {result.items.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-[var(--pp-border)] bg-white p-8 text-sm text-zinc-600">
            {load.status === "unavailable"
              ? load.message
              : load.status === "empty"
                ? load.message
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
