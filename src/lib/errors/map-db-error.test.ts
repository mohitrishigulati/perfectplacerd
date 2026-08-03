import { describe, expect, it } from "vitest";
import { mapDbError } from "@/lib/errors/map-db-error";
import { PUBLIC_GENERIC_ERROR } from "@/lib/errors/public-messages";

describe("mapDbError", () => {
  it("maps duplicate key without leaking provider text", () => {
    const mapped = mapDbError({
      code: "23505",
      message: 'duplicate key value violates unique constraint "applications_pkey"',
    });
    expect(mapped.message).not.toContain("constraint");
    expect(mapped.kind).toBe("duplicate");
  });

  it("returns generic message for unknown database errors", () => {
    const mapped = mapDbError({
      code: "XX000",
      message: "internal postgres detail users should not see",
    });
    expect(mapped.message).toBe(PUBLIC_GENERIC_ERROR);
    expect(mapped.message).not.toContain("postgres");
  });
});
