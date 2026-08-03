import { test, expect } from "@playwright/test";

test.describe("admin applications panel", () => {
  test.beforeEach(async ({ context, baseURL, page }) => {
    const hostname = new URL(baseURL ?? "http://127.0.0.1").hostname;
    await context.addCookies([
      { name: "pp-e2e-fixture", value: "1", path: "/e2e-fixtures", domain: hostname },
    ]);
    await page.goto("/e2e-fixtures/admin-applications");
    await page.evaluate(() => {
      window.__E2E_APPLICATIONS_MODE = "success";
      window.__E2E_APPLICATIONS_CALLS = [];
    });
  });

  test("changes application status and records the update call", async ({ page }) => {
    await page.getByLabel("Application status").selectOption("accepted");

    await page.waitForFunction(
      () => (window.__E2E_APPLICATIONS_CALLS ?? []).length > 0,
    );
    const calls = await page.evaluate(() => window.__E2E_APPLICATIONS_CALLS ?? []);
    expect(calls[0]).toMatchObject({
      action: "updateStatus",
      input: { applicationId: "app-1", jobId: "job-1", status: "accepted" },
    });
  });

  test("shows an inline error when the status update fails", async ({ page }) => {
    await page.evaluate(() => {
      window.__E2E_APPLICATIONS_MODE = "error";
    });
    await page.getByLabel("Application status").selectOption("rejected");
    await expect(page.getByText("Could not update application status.")).toBeVisible();
  });

  test("records a resume download request", async ({ page, context }) => {
    const popupPromise = context.waitForEvent("page");
    await page.getByText("Download").click();
    const popup = await popupPromise;
    await popup.close();

    const calls = await page.evaluate(() => window.__E2E_APPLICATIONS_CALLS ?? []);
    expect(calls[0]).toMatchObject({ action: "downloadResume", resumeId: "resume-1" });
  });
});

test("admin applications fixture is hidden without the fixture cookie", async ({ page }) => {
  const response = await page.goto("/e2e-fixtures/admin-applications");
  expect(response?.status()).toBe(404);
});
