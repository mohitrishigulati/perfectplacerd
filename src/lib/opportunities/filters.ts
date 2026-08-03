import { z } from "zod";

export const WORK_MODES = ["onsite", "hybrid", "remote"] as const;
export const EXPERIENCE_LEVELS = [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
] as const;

export const opportunityFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  location: z.string().trim().max(120).optional(),
  experience: z.enum(EXPERIENCE_LEVELS).optional(),
  industry: z.string().trim().max(120).optional(),
  workMode: z.enum(WORK_MODES).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type OpportunityFilters = z.infer<typeof opportunityFiltersSchema>;

export const OPPORTUNITIES_PAGE_SIZE = 12;

export function parseOpportunityFilters(
  params: Record<string, string | string[] | undefined>,
): OpportunityFilters {
  const raw = {
    q: typeof params.q === "string" ? params.q : undefined,
    location: typeof params.location === "string" ? params.location : undefined,
    experience:
      typeof params.experience === "string" ? params.experience : undefined,
    industry: typeof params.industry === "string" ? params.industry : undefined,
    workMode: typeof params.workMode === "string" ? params.workMode : undefined,
    page: typeof params.page === "string" ? params.page : "1",
  };

  const parsed = opportunityFiltersSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  return opportunityFiltersSchema.parse({ page: 1 });
}

export function buildOpportunityQueryString(
  filters: OpportunityFilters,
  overrides?: Partial<OpportunityFilters>,
): string {
  const merged = { ...filters, ...overrides };
  const search = new URLSearchParams();

  if (merged.q) search.set("q", merged.q);
  if (merged.location) search.set("location", merged.location);
  if (merged.experience) search.set("experience", merged.experience);
  if (merged.industry) search.set("industry", merged.industry);
  if (merged.workMode) search.set("workMode", merged.workMode);
  if (merged.page && merged.page > 1) search.set("page", String(merged.page));

  const query = search.toString();
  return query ? `?${query}` : "";
}
