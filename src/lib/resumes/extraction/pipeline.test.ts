import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/resumes/extraction/text-extract", () => ({
  extractResumeTextFromBytes: vi.fn(async () => ({
    ok: true,
    text: "jane@example.com skills: python",
    usedOcr: false,
  })),
}));

vi.mock("@/lib/resumes/extraction/provider", () => ({
  getResumeExtractor: vi.fn(() => ({
    id: "heuristic",
    extractStructuredProfile: vi.fn(async () => ({
      ok: true,
      data: { email: "jane@example.com", skills: ["python"] },
      confidence: { email: 0.9, skills: 0.6 },
      needsReview: ["skills"],
    })),
  })),
}));

describe("runResumeParsingPipeline", () => {
  beforeEach(() => {
    vi.stubEnv("RESUME_EXTRACTION_PROVIDER", "heuristic");
  });

  it("stores completed parsing results without raw provider payloads", async () => {
    const updates: Record<string, unknown>[] = [];
    const supabase = {
      from: () => ({
        update: (payload: Record<string, unknown>) => ({
          eq: () => ({
            eq: async () => {
              updates.push(payload);
              return { error: null };
            },
          }),
        }),
      }),
    };

    const { runResumeParsingPipeline } = await import(
      "@/lib/resumes/extraction/pipeline"
    );

    await runResumeParsingPipeline({
      supabase: supabase as never,
      resumeId: "resume-1",
      userId: "user-1",
      bytes: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      mimeType: "application/pdf",
      kind: "pdf",
    });

    const completed = updates.find(
      (row) => row.parsing_status === "completed",
    ) as { extracted_data?: Record<string, unknown> } | undefined;

    expect(completed).toBeTruthy();
    expect(completed?.extracted_data).toMatchObject({
      email: "jane@example.com",
      _meta: { extractorId: "heuristic" },
    });
    vi.unstubAllEnvs();
  });
});
