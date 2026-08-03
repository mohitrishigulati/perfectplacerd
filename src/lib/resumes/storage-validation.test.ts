import { describe, expect, it } from "vitest";
import {
  MAX_RESUME_BYTES,
  validateResumeFileContent,
} from "@/lib/resumes/storage-validation";

const MIN_PDF = new TextEncoder().encode(
  "%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n",
);

describe("resume file validation", () => {
  it("accepts valid pdf with matching mime and extension", () => {
    const result = validateResumeFileContent(
      MIN_PDF,
      "application/pdf",
      "resume.pdf",
    );
    expect(result.ok).toBe(true);
  });

  it("rejects files over 10 MB", () => {
    const huge = new Uint8Array(MAX_RESUME_BYTES + 1);
    huge.set(MIN_PDF.slice(0, 5));
    const result = validateResumeFileContent(
      huge,
      "application/pdf",
      "resume.pdf",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("size");
    }
  });

  it("rejects unsupported extensions", () => {
    const result = validateResumeFileContent(
      MIN_PDF,
      "application/pdf",
      "resume.exe",
    );
    expect(result.ok).toBe(false);
  });

  it("rejects mime and extension mismatch", () => {
    const result = validateResumeFileContent(
      MIN_PDF,
      "image/png",
      "resume.pdf",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("mismatch");
    }
  });

  it("rejects zip archives masquerading as pdf", () => {
    const zip = new TextEncoder().encode("PK\x03\x04fake");
    const result = validateResumeFileContent(
      zip,
      "application/pdf",
      "resume.pdf",
    );
    expect(result.ok).toBe(false);
  });

  it("rejects svg content for png uploads", () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const result = validateResumeFileContent(svg, "image/png", "scan.png");
    expect(result.ok).toBe(false);
  });
});
