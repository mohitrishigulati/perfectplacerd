import { describe, expect, it } from "vitest";
import { evaluateAuthGuard } from "@/lib/auth/guard";

const origin = "http://localhost:3000";

describe("evaluateAuthGuard", () => {
  it("redirects unauthenticated users from candidate routes", () => {
    const result = evaluateAuthGuard({
      pathname: "/dashboard",
      origin,
      userId: null,
      isAdmin: false,
    });
    expect(result).toEqual({
      action: "redirect",
      url: "http://localhost:3000/auth?next=%2Fdashboard",
    });
  });

  it("redirects unauthenticated users from admin routes", () => {
    const result = evaluateAuthGuard({
      pathname: "/admin/jobs",
      origin,
      userId: null,
      isAdmin: false,
    });
    expect(result.action).toBe("redirect");
    if (result.action === "redirect") {
      expect(result.url).toContain("/auth?next=%2Fadmin%2Fjobs");
    }
  });

  it("blocks non-admin users from admin routes", () => {
    const result = evaluateAuthGuard({
      pathname: "/admin",
      origin,
      userId: "user-1",
      isAdmin: false,
    });
    expect(result).toEqual({
      action: "redirect",
      url: "http://localhost:3000/auth?error=admin_required",
    });
  });

  it("allows admin users on admin routes", () => {
    const result = evaluateAuthGuard({
      pathname: "/admin",
      origin,
      userId: "admin-1",
      isAdmin: true,
    });
    expect(result).toEqual({ action: "allow" });
  });

  it("redirects signed-in users away from /auth", () => {
    const params = new URLSearchParams({ next: "/admin" });
    const result = evaluateAuthGuard({
      pathname: "/auth",
      origin,
      userId: "user-1",
      isAdmin: false,
      searchParams: params,
    });
    expect(result).toEqual({
      action: "redirect",
      url: "http://localhost:3000/admin",
    });
  });

  it("allows public routes", () => {
    const result = evaluateAuthGuard({
      pathname: "/",
      origin,
      userId: null,
      isAdmin: false,
    });
    expect(result).toEqual({ action: "allow" });
  });
});
