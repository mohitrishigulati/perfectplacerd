import { createClient } from "@/lib/supabase/server";
import {
  OPPORTUNITIES_PAGE_SIZE,
  type OpportunityFilters,
} from "@/lib/opportunities/filters";
import type {
  ApplicationStatus,
  ExperienceLevel,
  JobStatus,
  WorkMode,
} from "@/types/database";

export type OpportunityListItem = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  industry: string | null;
  work_mode: WorkMode | null;
  experience_level: ExperienceLevel | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  published_at: string | null;
};

export type OpportunityDetail = OpportunityListItem & {
  description: string;
  department: string | null;
  status: JobStatus;
};

export type OpportunitySearchResult = {
  items: OpportunityListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type OpportunityFacets = {
  locations: string[];
  industries: string[];
};

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function getOpportunityFacets(): Promise<OpportunityFacets> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("location, industry")
    .eq("status", "published");

  const locations = new Set<string>();
  const industries = new Set<string>();

  for (const row of data ?? []) {
    if (row.location?.trim()) locations.add(row.location.trim());
    if (row.industry?.trim()) industries.add(row.industry.trim());
  }

  return {
    locations: [...locations].sort((a, b) => a.localeCompare(b)),
    industries: [...industries].sort((a, b) => a.localeCompare(b)),
  };
}

export async function searchOpportunities(
  filters: OpportunityFilters,
): Promise<OpportunitySearchResult> {
  const supabase = await createClient();
  const page = filters.page;
  const from = (page - 1) * OPPORTUNITIES_PAGE_SIZE;
  const to = from + OPPORTUNITIES_PAGE_SIZE - 1;

  let query = supabase
    .from("jobs")
    .select(
      "id, slug, title, location, employment_type, industry, work_mode, experience_level, salary_min, salary_max, salary_currency, published_at",
      { count: "exact" },
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (filters.q) {
    query = query.textSearch("search_vector", filters.q.trim(), {
      type: "websearch",
      config: "english",
    });
  }

  if (filters.location) {
    query = query.ilike("location", `%${escapeIlike(filters.location)}%`);
  }
  if (filters.industry) {
    query = query.ilike("industry", `%${escapeIlike(filters.industry)}%`);
  }
  if (filters.experience) {
    query = query.eq("experience_level", filters.experience);
  }
  if (filters.workMode) {
    query = query.eq("work_mode", filters.workMode);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (filters.q) {
      return searchOpportunitiesKeywordFallback(filters, from, to);
    }
    throw new Error(error.message);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / OPPORTUNITIES_PAGE_SIZE));

  return {
    items: data ?? [],
    total,
    page,
    pageSize: OPPORTUNITIES_PAGE_SIZE,
    totalPages,
  };
}

async function searchOpportunitiesKeywordFallback(
  filters: OpportunityFilters,
  from: number,
  to: number,
): Promise<OpportunitySearchResult> {
  const supabase = await createClient();
  const keyword = `%${escapeIlike(filters.q ?? "")}%`;

  let query = supabase
    .from("jobs")
    .select(
      "id, slug, title, location, employment_type, industry, work_mode, experience_level, salary_min, salary_max, salary_currency, published_at",
      { count: "exact" },
    )
    .eq("status", "published")
    .or(
      `title.ilike.${keyword},description.ilike.${keyword},industry.ilike.${keyword}`,
    )
    .order("published_at", { ascending: false });

  if (filters.location) {
    query = query.ilike("location", `%${escapeIlike(filters.location)}%`);
  }
  if (filters.industry) {
    query = query.ilike("industry", `%${escapeIlike(filters.industry)}%`);
  }
  if (filters.experience) {
    query = query.eq("experience_level", filters.experience);
  }
  if (filters.workMode) {
    query = query.eq("work_mode", filters.workMode);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    throw new Error(error.message);
  }

  const total = count ?? 0;
  return {
    items: data ?? [],
    total,
    page: filters.page,
    pageSize: OPPORTUNITIES_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / OPPORTUNITIES_PAGE_SIZE)),
  };
}

export async function getOpportunityBySlug(
  slug: string,
): Promise<OpportunityDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, slug, title, description, location, employment_type, department, industry, work_mode, experience_level, salary_min, salary_max, salary_currency, published_at, status",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export type ViewerOpportunityState = {
  savedJobId: string | null;
  application: {
    id: string;
    status: ApplicationStatus;
    created_at: string;
  } | null;
  hasPrimaryResume: boolean;
};

export async function getViewerOpportunityState(
  jobId: string,
  userId: string | null,
): Promise<ViewerOpportunityState> {
  if (!userId) {
    return {
      savedJobId: null,
      application: null,
      hasPrimaryResume: false,
    };
  }

  const supabase = await createClient();
  const [{ data: saved }, { data: application }, { data: resume }] =
    await Promise.all([
      supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", userId)
        .eq("job_id", jobId)
        .maybeSingle(),
      supabase
        .from("applications")
        .select("id, status, created_at")
        .eq("candidate_id", userId)
        .eq("job_id", jobId)
        .maybeSingle(),
      supabase
        .from("resumes")
        .select("id")
        .eq("user_id", userId)
        .eq("is_primary", true)
        .maybeSingle(),
    ]);

  return {
    savedJobId: saved?.id ?? null,
    application: application ?? null,
    hasPrimaryResume: Boolean(resume),
  };
}
