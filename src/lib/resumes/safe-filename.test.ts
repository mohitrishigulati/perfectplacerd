import { describe, expect, it } from "vitest";
import {
  buildResumeStorageObjectPath,
  parseResumeStoragePath,
  sanitizeStoredFileName,
} from "@/lib/resumes/safe-filename";

describe("resume safe filename", () => {
  it("removes path traversal from stored names", () => {
    expect(sanitizeStoredFileName("../evil.pdf")).toBe("evil.pdf");
    expect(sanitizeStoredFileName("..\\resume.pdf")).toBe("resume.pdf");
  });

  it("builds user-scoped storage paths with uuid folder", () => {
    const path = buildResumeStorageObjectPath(
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-4222-8222-222222222222",
      "My Resume!.pdf",
    );
    expect(path).toBe(
      "11111111-1111-1111-1111-111111111111/22222222-2222-4222-8222-222222222222/My-Resume.pdf",
    );
  });

  it("parses valid resume storage paths", () => {
    const parsed = parseResumeStoragePath(
      "11111111-1111-1111-1111-111111111111/22222222-2222-4222-8222-222222222222/resume.pdf",
    );
    expect(parsed?.userId).toBe("11111111-1111-1111-1111-111111111111");
    expect(parsed?.storedFileName).toBe("resume.pdf");
  });

  it("rejects path traversal and invalid shapes", () => {
    expect(parseResumeStoragePath("user/../other/file.pdf")).toBeNull();
    expect(parseResumeStoragePath("only/two.pdf")).toBeNull();
  });
});
