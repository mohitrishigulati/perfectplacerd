import { describe, expect, it } from "vitest";
import { middlewareNeedsAuthSession } from "@/lib/supabase/middleware";

describe("middlewareNeedsAuthSession", () => {
  it("skips public marketing and SEO routes", () => {
    expect(middlewareNeedsAuthSession("/")).toBe(false);
    expect(middlewareNeedsAuthSession("/about")).toBe(false);
    expect(middlewareNeedsAuthSession("/opportunities")).toBe(false);
    expect(middlewareNeedsAuthSession("/privacy")).toBe(false);
  });

  it("runs for auth, dashboard, and admin", () => {
    expect(middlewareNeedsAuthSession("/auth")).toBe(true);
    expect(middlewareNeedsAuthSession("/auth/callback")).toBe(true);
    expect(middlewareNeedsAuthSession("/dashboard")).toBe(true);
    expect(middlewareNeedsAuthSession("/dashboard/resume")).toBe(true);
    expect(middlewareNeedsAuthSession("/admin")).toBe(true);
    expect(middlewareNeedsAuthSession("/admin/jobs")).toBe(true);
  });
});
