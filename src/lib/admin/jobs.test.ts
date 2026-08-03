import { describe, expect, it } from "vitest";
import {
  canPerformJobStatusAction,
  slugifyTitle,
} from "@/lib/admin/jobs";

describe("admin job helpers", () => {
  it("slugifies titles", () => {
    expect(slugifyTitle("Senior Product Designer")).toBe("senior-product-designer");
  });

  it("allows publish from draft and pause from published", () => {
    expect(canPerformJobStatusAction("draft", "publish")).toBe(true);
    expect(canPerformJobStatusAction("published", "pause")).toBe(true);
    expect(canPerformJobStatusAction("published", "close")).toBe(true);
    expect(canPerformJobStatusAction("archived", "publish")).toBe(false);
  });
});
