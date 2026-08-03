import type { MetadataRoute } from "next";
import { logServerError } from "@/lib/logging/server-error";
import { createAnonDatabaseClient } from "@/lib/supabase/anon-server";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/public-env";
import { absoluteUrl } from "@/lib/site/url";

const STATIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/clients",
  "/contact",
  "/opportunities",
  "/privacy",
  "/terms",
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  if (!isSupabasePublicEnvConfigured()) {
    return staticEntries;
  }

  try {
    const supabase = createAnonDatabaseClient();
    if (!supabase) {
      return staticEntries;
    }
    const { data: jobs } = await supabase
      .from("jobs")
      .select("slug, published_at, updated_at")
      .eq("status", "published");

    const jobEntries: MetadataRoute.Sitemap = (jobs ?? []).map((job) => ({
      url: absoluteUrl(`/opportunities/${job.slug}`),
      lastModified: new Date(job.updated_at ?? job.published_at ?? Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...jobEntries];
  } catch (error) {
    logServerError("sitemap", error);
    return staticEntries;
  }
}
