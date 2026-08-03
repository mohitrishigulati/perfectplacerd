import { describe, expect, it } from "vitest";
import {
  isResumeStoragePathOwnedByUser,
  MAX_RESUME_BYTES,
} from "@/lib/resumes/storage-validation";

describe("resume storage path ownership", () => {
  const userId = "11111111-1111-1111-1111-111111111111";

  it("accepts user-owned uuid paths", () => {
    expect(
      isResumeStoragePathOwnedByUser(
        `${userId}/22222222-2222-4222-8222-222222222222/resume.pdf`,
        userId,
      ),
    ).toBe(true);
  });

  it("rejects other users and traversal", () => {
    expect(
      isResumeStoragePathOwnedByUser(
        "22222222-2222-2222-2222-222222222222/uuid/file.pdf",
        userId,
      ),
    ).toBe(false);
    expect(
      isResumeStoragePathOwnedByUser(`${userId}/../other/file.pdf`, userId),
    ).toBe(false);
  });
});

describe("resume limits", () => {
  it("uses a 10 MB maximum", () => {
    expect(MAX_RESUME_BYTES).toBe(10 * 1024 * 1024);
  });
});
