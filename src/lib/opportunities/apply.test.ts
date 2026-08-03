import { describe, expect, it } from "vitest";
import { getApplyEligibility } from "@/lib/opportunities/apply";

describe("getApplyEligibility", () => {
  it("requires authentication", () => {
    expect(
      getApplyEligibility({
        isAuthenticated: false,
        hasPrimaryResume: true,
        existingApplicationStatus: null,
        isPublished: true,
      }).canApply,
    ).toBe(false);
  });

  it("blocks duplicate applications", () => {
    const result = getApplyEligibility({
      isAuthenticated: true,
      hasPrimaryResume: true,
      existingApplicationStatus: "submitted",
      isPublished: true,
    });
    expect(result).toEqual({ canApply: false, reason: "already_applied" });
  });

  it("requires a primary resume", () => {
    const result = getApplyEligibility({
      isAuthenticated: true,
      hasPrimaryResume: false,
      existingApplicationStatus: null,
      isPublished: true,
    });
    expect(result).toEqual({ canApply: false, reason: "missing_resume" });
  });

  it("allows apply when eligible", () => {
    expect(
      getApplyEligibility({
        isAuthenticated: true,
        hasPrimaryResume: true,
        existingApplicationStatus: null,
        isPublished: true,
      }),
    ).toEqual({ canApply: true });
  });
});
