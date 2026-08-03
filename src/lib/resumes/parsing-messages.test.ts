import { describe, expect, it } from "vitest";
import { getParsingUserMessage } from "@/lib/resumes/parsing-messages";

describe("parsing user messages", () => {
  it("does not expose provider payloads or personal details", () => {
    const message = getParsingUserMessage("provider_failed");
    expect(message).not.toMatch(/openai|sk-|api/i);
    expect(message).not.toMatch(/@/);
  });

  it("explains when automatic suggestions are unavailable", () => {
    expect(getParsingUserMessage("provider_unavailable")).toContain(
      "temporarily unavailable",
    );
  });
});
