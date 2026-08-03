import { test, expect } from "@playwright/test";

test.describe("resume processing synthetic checks", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    const hostname = new URL(baseURL ?? "http://127.0.0.1").hostname;
    await context.addCookies([
      {
        name: "pp-e2e-fixture",
        value: "1",
        path: "/e2e-fixtures",
        domain: hostname,
      },
    ]);
  });

  test("validates PDF, DOCX, JPEG OCR state, rejects bad files, snapshot policy", async ({
    page,
  }) => {
    await page.goto("/e2e-fixtures/resume-processing");
    await expect(page.getByText("ALL_CHECKS_PASS")).toBeVisible();
    await expect(page.locator('[data-check-id="pdf-suggestions"][data-pass="true"]')).toBeVisible();
    await expect(page.locator('[data-check-id="docx-suggestions"][data-pass="true"]')).toBeVisible();
    await expect(page.locator('[data-check-id="jpeg-ocr-state"][data-pass="true"]')).toBeVisible();
    await expect(page.locator('[data-check-id="unsupported-rejected"][data-pass="true"]')).toBeVisible();
    await expect(page.locator('[data-check-id="oversize-rejected"][data-pass="true"]')).toBeVisible();
    await expect(
      page.locator('[data-check-id="application-snapshot-policy"][data-pass="true"]'),
    ).toBeVisible();
  });
});

test("resume processing fixture hidden without cookie", async ({ page }) => {
  const response = await page.goto("/e2e-fixtures/resume-processing");
  expect(response?.status()).toBe(404);
});
