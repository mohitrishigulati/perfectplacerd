import { describe, expect, it } from "vitest";
import { sanitizeReturnPath } from "@/lib/auth/return-path";

describe("sanitizeReturnPath", () => {
  it("preserves safe opportunity paths", () => {
    expect(sanitizeReturnPath("/opportunities/cfo-role", "/opportunities")).toBe(
      "/opportunities/cfo-role",
    );
  });

  it("blocks external redirects", () => {
    expect(
      sanitizeReturnPath("https://evil.example", "/opportunities"),
    ).toBe("/opportunities");
  });
});
