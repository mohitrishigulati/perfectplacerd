import { describe, expect, it } from "vitest";
import { HeuristicResumeExtractor } from "@/lib/resumes/extraction/heuristic-extractor";

describe("HeuristicResumeExtractor", () => {
  it("extracts email and phone without inventing a name", async () => {
    const extractor = new HeuristicResumeExtractor();
    const result = await extractor.extractStructuredProfile({
      mimeType: "application/pdf",
      fileKind: "pdf",
      normalizedText:
        "Contact: jane.doe@example.com | +91 9876543210\nSkills: Python, SQL, Leadership",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("jane.doe@example.com");
      expect(result.data.full_name).toBeUndefined();
      expect(result.needsReview).toContain("phone");
    }
  });
});
