import { describe, expect, it } from "vitest";
import { calculateProfileCompletion } from "@/lib/profile/completion";

describe("calculateProfileCompletion", () => {
  it("returns low completion for empty profiles", () => {
    const result = calculateProfileCompletion({});
    expect(result.percent).toBeLessThan(30);
    expect(result.completedCount).toBe(0);
  });

  it("reaches high completion when core fields are filled", () => {
    const result = calculateProfileCompletion({
      full_name: "Alex Candidate",
      headline: "Product designer",
      location: "Berlin",
      phone: "+49123456789",
      bio: "I have more than ten years of experience designing accessible products for global teams.",
      skills: ["UX", "Research", "Figma"],
      preferences: {
        remote: "hybrid",
        employmentTypes: ["Full-time"],
        preferredLocations: ["Berlin"],
      },
      hasPrimaryResume: true,
    });

    expect(result.percent).toBeGreaterThanOrEqual(90);
    expect(result.completedCount).toBe(result.totalCount);
  });
});
