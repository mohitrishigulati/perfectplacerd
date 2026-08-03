import { describe, expect, it } from "vitest";
import {
  authRedirectUrl,
  isAdminRoute,
  isCandidateRoute,
  legacyCandidateRedirect,
  sanitizeNextPath,
} from "@/lib/auth/paths";

describe("auth paths", () => {
  it("detects candidate and admin routes", () => {
    expect(isCandidateRoute("/dashboard")).toBe(true);
    expect(isCandidateRoute("/dashboard/applications")).toBe(true);
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/jobs")).toBe(true);
    expect(isCandidateRoute("/admin")).toBe(false);
  });

  it("redirects legacy candidate paths", () => {
    expect(legacyCandidateRedirect("/candidate")).toBe("/dashboard");
    expect(legacyCandidateRedirect("/candidate/foo")).toBe("/dashboard/foo");
    expect(legacyCandidateRedirect("/dashboard")).toBeNull();
  });

  it("sanitizes unsafe next paths", () => {
    expect(sanitizeNextPath("/dashboard/applications")).toBe(
      "/dashboard/applications",
    );
    expect(sanitizeNextPath("//evil.com")).toBe("/dashboard");
    expect(sanitizeNextPath("https://evil.com")).toBe("/dashboard");
    expect(sanitizeNextPath("/auth")).toBe("/dashboard");
    expect(sanitizeNextPath(null)).toBe("/dashboard");
  });

  it("builds auth redirect URLs with next param", () => {
    const url = authRedirectUrl("/admin", "http://localhost:3000");
    expect(url).toBe(
      "http://localhost:3000/auth?next=%2Fadmin",
    );
  });
});
