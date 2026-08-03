import { describe, expect, it } from "vitest";
import {
  createNoIndexMetadata,
  createPublicMetadata,
  formatBrandedTitle,
} from "@/lib/site/metadata";

describe("formatBrandedTitle", () => {
  it("appends brand when missing", () => {
    expect(formatBrandedTitle("Contact Us")).toBe("Contact Us | Perfect Placer");
  });

  it("does not duplicate brand when already present", () => {
    expect(formatBrandedTitle("About Perfect Placer")).toBe("About Perfect Placer");
  });
});

describe("createPublicMetadata", () => {
  it("uses page title only so root template adds brand once", () => {
    const metadata = createPublicMetadata({
      title: "Privacy Policy",
      description: "Privacy",
      path: "/privacy",
    });
    expect(metadata.title).toBe("Privacy Policy");
    expect(metadata.openGraph?.title).toBe("Privacy Policy | Perfect Placer");
  });
});

describe("createNoIndexMetadata", () => {
  it("uses page title only", () => {
    const metadata = createNoIndexMetadata("Sign in");
    expect(metadata.title).toBe("Sign in");
  });
});
