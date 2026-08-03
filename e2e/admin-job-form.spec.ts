import { test, expect } from "@playwright/test";

test.describe("admin job form", () => {
  test.beforeEach(async ({ context, baseURL, page }) => {
    const hostname = new URL(baseURL ?? "http://127.0.0.1").hostname;
    await context.addCookies([
      { name: "pp-e2e-fixture", value: "1", path: "/e2e-fixtures", domain: hostname },
    ]);
    await page.goto("/e2e-fixtures/admin-job-form");
    await page.evaluate(() => {
      window.__E2E_JOB_FORM_MODE = "success";
      window.__E2E_JOB_FORM_CALLS = [];
    });
  });

  test("blocks submission when the title is missing", async ({ page }) => {
    await page.getByLabel("Description").fill(
      "A description that is definitely twenty characters or more.",
    );
    await page.getByText("Create draft").click();
    await expect(page.getByText("Title is required")).toBeVisible();
    const calls = await page.evaluate(() => window.__E2E_JOB_FORM_CALLS ?? []);
    expect(calls).toHaveLength(0);
  });

  test("rejects an inverted salary range", async ({ page }) => {
    await page.getByLabel("Title").fill("Head of Growth");
    await page.getByLabel("Description").fill(
      "A description that is definitely twenty characters or more.",
    );
    await page.getByLabel("Salary min").fill("200000");
    await page.getByLabel("Salary max").fill("100000");
    await page.getByText("Create draft").click();
    await expect(
      page.getByText("Minimum salary must be less than or equal to maximum salary"),
    ).toBeVisible();
  });

  test("auto-generates the slug from the title when left blank", async ({ page }) => {
    await page.getByLabel("Title").fill("Head of Growth");
    await page.getByLabel("Description").fill(
      "A description that is definitely twenty characters or more.",
    );
    await page.getByText("Create draft").click();

    await page.waitForFunction(
      () => (window.__E2E_JOB_FORM_CALLS ?? []).length > 0,
    );
    const calls = await page.evaluate(() => window.__E2E_JOB_FORM_CALLS ?? []);
    expect(calls[0]).toMatchObject({
      action: "create",
      input: { title: "Head of Growth", slug: "head-of-growth" },
    });
  });

  test("shows a server error inline without navigating away", async ({ page }) => {
    await page.evaluate(() => {
      window.__E2E_JOB_FORM_MODE = "error";
    });
    await page.getByLabel("Title").fill("Head of Growth");
    await page.getByLabel("Description").fill(
      "A description that is definitely twenty characters or more.",
    );
    await page.getByText("Create draft").click();
    await expect(page.getByText("That slug is already in use.")).toBeVisible();
    await expect(page).toHaveURL(/e2e-fixtures\/admin-job-form/);
  });

  test("edit mode prefills the job and reports success without navigating", async ({
    page,
  }) => {
    await page.goto("/e2e-fixtures/admin-job-form?mode=edit");
    await page.evaluate(() => {
      window.__E2E_JOB_FORM_MODE = "success";
      window.__E2E_JOB_FORM_CALLS = [];
    });

    await expect(page.getByLabel("Title")).toHaveValue("VP Engineering");
    await page.getByText("Save changes").click();

    await expect(page.getByText("Opportunity saved.")).toBeVisible();
    await expect(page).toHaveURL(/mode=edit/);
  });
});

test("admin job form fixture is hidden without the fixture cookie", async ({ page }) => {
  const response = await page.goto("/e2e-fixtures/admin-job-form");
  expect(response?.status()).toBe(404);
});
