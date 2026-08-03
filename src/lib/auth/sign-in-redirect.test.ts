import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSignInEmailRedirectTo } from "@/lib/auth/sign-in-redirect";
import { getAuthCallbackOrigin, getSiteUrl } from "@/lib/site/url";

const PRODUCTION_SITE = "https://perfect-placer-v2.vercel.app";

describe("buildSignInEmailRedirectTo", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL for the callback host on Vercel/production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PRODUCTION_SITE);
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(getAuthCallbackOrigin()).toBe(PRODUCTION_SITE);
    expect(buildSignInEmailRedirectTo("/dashboard")).toBe(
      `${PRODUCTION_SITE}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    );
  });

  it("uses localhost for auth callbacks during local next dev", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PRODUCTION_SITE);
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_URL", "");

    expect(getSiteUrl()).toBe(PRODUCTION_SITE);
    expect(getAuthCallbackOrigin()).toBe("http://localhost:3000");
    expect(buildSignInEmailRedirectTo("/dashboard")).toContain(
      "http://localhost:3000/auth/callback",
    );
  });

  it("does not allow a client-style malicious origin to change the callback host", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PRODUCTION_SITE);

    const maliciousOrigin = "https://attacker.example";
    const redirect = buildSignInEmailRedirectTo("/opportunities");

    expect(redirect.startsWith(`${PRODUCTION_SITE}/auth/callback`)).toBe(true);
    expect(redirect).not.toContain(maliciousOrigin);
  });

  it("sanitizes unsafe next paths before encoding", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", PRODUCTION_SITE);

    const redirect = buildSignInEmailRedirectTo("https://evil.example/phish");

    expect(redirect).toBe(
      `${PRODUCTION_SITE}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    );
  });
});
