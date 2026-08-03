import { afterEach, describe, expect, it } from "vitest";
import { buildSignInEmailRedirectTo } from "@/lib/auth/sign-in-redirect";
import { getSiteUrl } from "@/lib/site/url";

const PRODUCTION_SITE = "https://perfect-placer-v2.vercel.app";

describe("buildSignInEmailRedirectTo", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  it("uses NEXT_PUBLIC_SITE_URL for the callback host in production", () => {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE;

    expect(getSiteUrl()).toBe(PRODUCTION_SITE);
    expect(buildSignInEmailRedirectTo("/dashboard")).toBe(
      `${PRODUCTION_SITE}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    );
  });

  it("does not allow a client-style malicious origin to change the callback host", () => {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE;

    const maliciousOrigin = "https://attacker.example";
    const redirect = buildSignInEmailRedirectTo("/opportunities");

    expect(redirect.startsWith(`${PRODUCTION_SITE}/auth/callback`)).toBe(true);
    expect(redirect).not.toContain(maliciousOrigin);
    expect(redirect).not.toContain("localhost");
  });

  it("sanitizes unsafe next paths before encoding", () => {
    process.env.NEXT_PUBLIC_SITE_URL = PRODUCTION_SITE;

    const redirect = buildSignInEmailRedirectTo("https://evil.example/phish");

    expect(redirect).toBe(
      `${PRODUCTION_SITE}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
    );
  });
});
