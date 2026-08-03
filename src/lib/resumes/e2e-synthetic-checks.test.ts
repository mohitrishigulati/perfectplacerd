import { describe, expect, it, beforeAll, vi } from "vitest";
import { execSync } from "node:child_process";
import { runSyntheticResumeChecks } from "@/lib/resumes/e2e-synthetic-checks";
import fs from "node:fs";
import path from "node:path";

vi.mock("server-only", () => ({}));

describe("synthetic resume e2e checks", () => {
  beforeAll(() => {
    const fixtureDir = path.join(process.cwd(), "e2e", "fixtures", "resumes");
    if (!fs.existsSync(path.join(fixtureDir, "synthetic.pdf"))) {
      execSync("node scripts/generate-e2e-resume-fixtures.mjs", {
        stdio: "inherit",
      });
    }
  });

  it("passes all fixture scenarios", async () => {
    const checks = await runSyntheticResumeChecks();
    const failed = checks.filter((c) => !c.pass);
    expect(failed, JSON.stringify(failed)).toEqual([]);
  }, 30_000);
});
