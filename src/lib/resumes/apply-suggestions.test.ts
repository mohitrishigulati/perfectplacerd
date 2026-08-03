import { describe, expect, it } from "vitest";
import {
  buildSuggestionComparisonRows,
  mergeAcceptedSuggestions,
} from "@/lib/resumes/apply-suggestions";
import type { ProfileFormValues } from "@/lib/validations/profile";

const baseProfile: ProfileFormValues = {
  full_name: "Existing Name",
  phone: "9999999999",
  headline: "Existing headline",
  location: "Delhi",
  bio: "Existing bio",
  skills: ["Leadership"],
  preferences: { preferredLocations: ["Delhi"] },
  profile_visibility: "private",
};

describe("resume suggestion apply", () => {
  it("does not overwrite non-empty fields by default", () => {
    const merged = mergeAcceptedSuggestions({
      profile: baseProfile,
      extracted: {
        full_name: "Resume Name",
        phone: "8888888888",
        headline: "Resume headline",
        professional_summary: "Resume summary",
        skills: ["Python", "SQL"],
      },
      acceptedFields: ["full_name", "phone", "headline", "bio", "skills"],
      overwriteExisting: false,
    });

    expect(merged.full_name).toBe("Existing Name");
    expect(merged.phone).toBe("9999999999");
    expect(merged.headline).toBe("Existing headline");
    expect(merged.bio).toBe("Existing bio");
    expect(merged.skills).toEqual(["Leadership"]);
  });

  it("applies only selected fields when overwrite is enabled", () => {
    const merged = mergeAcceptedSuggestions({
      profile: baseProfile,
      extracted: {
        full_name: "Resume Name",
        phone: "8888888888",
        professional_summary: "Resume summary",
      },
      acceptedFields: ["full_name", "bio"],
      overwriteExisting: true,
    });

    expect(merged.full_name).toBe("Resume Name");
    expect(merged.phone).toBe("9999999999");
    expect(merged.bio).toBe("Resume summary");
  });

  it("marks low-confidence fields in comparison rows", () => {
    const rows = buildSuggestionComparisonRows({
      profile: {
        full_name: "",
        phone: null,
        headline: null,
        location: null,
        bio: null,
        skills: [],
        preferences: {},
      },
      extracted: { full_name: "Jane Doe", phone: "+91 98765 43210" },
      confidence: { full_name: 0.5, phone: 0.5 },
    });

    expect(rows.some((row) => row.key === "full_name" && row.lowConfidence)).toBe(
      true,
    );
    expect(rows.find((row) => row.key === "full_name")?.defaultSelected).toBe(true);
  });
});
