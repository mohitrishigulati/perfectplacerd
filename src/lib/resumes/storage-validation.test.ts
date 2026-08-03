import { describe, expect, it } from "vitest";
import {
  isAllowedResumeMimeType,
  isResumeStoragePathOwnedByUser,
  MAX_RESUME_BYTES,
} from "@/lib/resumes/storage-validation";

describe("resume storage validation", () => {
  const userId = "11111111-1111-1111-1111-111111111111";

  it("accepts paths under the user folder", () => {
    expect(
      isResumeStoragePathOwnedByUser(
        `${userId}/abc/file.pdf`,
        userId,
      ),
    ).toBe(true);
  });

  it("rejects path traversal and other users' prefixes", () => {
    expect(
      isResumeStoragePathOwnedByUser(`${userId}/../other/file.pdf`, userId),
    ).toBe(false);
    expect(
      isResumeStoragePathOwnedByUser(
        "22222222-2222-2222-2222-222222222222/file.pdf",
        userId,
      ),
    ).toBe(false);
  });

  it("allows standard resume MIME types", () => {
    expect(isAllowedResumeMimeType("application/pdf")).toBe(true);
  });

  it("defines 5 MB max", () => {
    expect(MAX_RESUME_BYTES).toBe(5 * 1024 * 1024);
  });
});
