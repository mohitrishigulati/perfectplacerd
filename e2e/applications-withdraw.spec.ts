import { test, expect } from "@playwright/test";

const FIXTURE_COOKIE = {
  name: "pp-e2e-fixture",
  value: "1",
  path: "/e2e-fixtures",
  domain: "127.0.0.1",
};

test.describe("application withdrawal UI", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([FIXTURE_COOKIE]);
    await page.goto("/e2e-fixtures/application-withdraw");
    await page.evaluate(() => {
      window.__E2E_WITHDRAW_MODE = "success";
      window.__E2E_WITHDRAW_CALLS = 0;
    });
  });

  test("shows withdraw for submitted and under_review only", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Withdraw application" })).toHaveCount(
      2,
    );
    await expect(page.getByText("Accepted")).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Closed Role/ }).getByRole("button", {
        name: "Withdraw application",
      }),
    ).toHaveCount(0);
  });

  test("requires confirmation before withdrawal", async ({ page }) => {
    await page.getByRole("button", { name: "Withdraw application" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Withdraw this application?" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("withdraws and shows Withdrawn status", async ({ page }) => {
    await page.getByRole("button", { name: "Withdraw application" }).first().click();
    await page.getByRole("button", { name: "Yes, withdraw" }).click();
    await expect(page.getByText("Withdrawn").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Withdraw application" })).toHaveCount(
      1,
    );
  });

  test("blocks duplicate confirm clicks while pending", async ({ page }) => {
    await page.evaluate(() => {
      window.__E2E_WITHDRAW_MODE = "slow";
    });
    await page.getByRole("button", { name: "Withdraw application" }).first().click();
    const confirm = page.getByRole("button", { name: "Yes, withdraw" });
    await confirm.click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "Withdrawing…" }),
    ).toBeDisabled();
    await page.waitForTimeout(900);
    const calls = await page.evaluate(() => window.__E2E_WITHDRAW_CALLS ?? 0);
    expect(calls).toBe(1);
  });

  test("shows friendly error when withdrawal fails", async ({ page }) => {
    await page.evaluate(() => {
      window.__E2E_WITHDRAW_MODE = "error";
    });
    await page.getByRole("button", { name: "Withdraw application" }).first().click();
    await page.getByRole("button", { name: "Yes, withdraw" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "This application cannot be withdrawn." }),
    ).toBeVisible();
  });
});

test("fixture route is hidden without fixture cookie", async ({ page }) => {
  const response = await page.goto("/e2e-fixtures/application-withdraw");
  expect(response?.status()).toBe(404);
});
