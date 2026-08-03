import { describe, expect, it } from "vitest";
import {
  buildOpportunityQueryString,
  parseOpportunityFilters,
} from "@/lib/opportunities/filters";

describe("opportunity filters", () => {
  it("parses filters from search params", () => {
    const filters = parseOpportunityFilters({
      q: "designer",
      location: "Berlin",
      experience: "senior",
      industry: "Technology",
      workMode: "remote",
      page: "2",
    });

    expect(filters).toEqual({
      q: "designer",
      location: "Berlin",
      experience: "senior",
      industry: "Technology",
      workMode: "remote",
      page: 2,
    });
  });

  it("builds query strings and omits empty values", () => {
    expect(
      buildOpportunityQueryString({
        q: "engineer",
        page: 1,
      }),
    ).toBe("?q=engineer");

    expect(
      buildOpportunityQueryString({
        q: "engineer",
        page: 3,
      }),
    ).toBe("?q=engineer&page=3");
  });
});
