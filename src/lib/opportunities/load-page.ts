import "server-only";

import type { OpportunityFilters } from "@/lib/opportunities/filters";
import {
  getOpportunityFacets,
  searchOpportunities,
  type OpportunityFacets,
  type OpportunitySearchResult,
} from "@/lib/opportunities/queries";
import {
  PUBLIC_LISTINGS_EMPTY,
  PUBLIC_LISTINGS_UNAVAILABLE,
} from "@/lib/errors/public-messages";
import { logServerError } from "@/lib/logging/server-error";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";

export type OpportunitiesLoadState =
  | { status: "ok"; result: OpportunitySearchResult; facets: OpportunityFacets }
  | { status: "unavailable"; message: string; result: OpportunitySearchResult; facets: OpportunityFacets }
  | { status: "empty"; message: string; result: OpportunitySearchResult; facets: OpportunityFacets };

const emptyResult = (filters: OpportunityFilters): OpportunitySearchResult => ({
  items: [],
  total: 0,
  page: filters.page,
  pageSize: 12,
  totalPages: 1,
});

const emptyFacets: OpportunityFacets = { locations: [], industries: [] };

export async function loadOpportunitiesPage(
  filters: OpportunityFilters,
): Promise<OpportunitiesLoadState> {
  const base = {
    result: emptyResult(filters),
    facets: emptyFacets,
  };

  if (!isSupabasePublicEnvConfigured()) {
    logServerError("opportunities", new Error("Supabase public env not configured"));
    return {
      status: "unavailable",
      message: PUBLIC_LISTINGS_UNAVAILABLE,
      ...base,
    };
  }

  try {
    const [result, facets] = await Promise.all([
      searchOpportunities(filters),
      getOpportunityFacets(),
    ]);

    if (result.total === 0 && !filters.q && !filters.location && !filters.industry) {
      return {
        status: "empty",
        message: PUBLIC_LISTINGS_EMPTY,
        result,
        facets,
      };
    }

    return { status: "ok", result, facets };
  } catch (error) {
    logServerError("opportunities", error);
    return {
      status: "unavailable",
      message: PUBLIC_LISTINGS_UNAVAILABLE,
      ...base,
    };
  }
}
