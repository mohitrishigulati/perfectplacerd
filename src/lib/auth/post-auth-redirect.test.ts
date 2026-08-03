import { describe, expect, it } from "vitest";
import { resolvePostAuthRedirectPath } from "@/lib/auth/post-auth-redirect";

describe("resolvePostAuthRedirectPath", () => {
  it("redirects successful OTP sign-in to dashboard by default", () => {
    expect(resolvePostAuthRedirectPath(null)).toBe("/dashboard");
  });

  it("preserves safe relative next paths", () => {
    expect(resolvePostAuthRedirectPath("/dashboard/profile")).toBe(
      "/dashboard/profile",
    );
  });

  it("sanitizes malicious next paths", () => {
    expect(resolvePostAuthRedirectPath("https://evil.example/phish")).toBe(
      "/dashboard",
    );
    expect(resolvePostAuthRedirectPath("//evil.example")).toBe("/dashboard");
  });
});
