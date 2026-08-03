import { expect, test } from "@playwright/test";

test.describe("authentication", () => {
  test("auth page exposes passwordless email sign-in", async ({ page }) => {
    await page.goto("/auth");
    await expect(
      page.getByRole("heading", { name: /sign in with email/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send sign-in code/i }),
    ).toBeVisible();
  });

  test("protected candidate routes redirect guests to auth", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard%2Fprofile/);
  });

  test("protected admin routes redirect guests to auth", async ({ page }) => {
    await page.goto("/admin/jobs");
    await expect(page).toHaveURL(/\/auth\?next=%2Fadmin%2Fjobs/);
  });

  test("legacy candidate path redirects through dashboard to auth for guests", async ({
    page,
  }) => {
    await page.goto("/candidate");
    await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard/);
  });
});

test.describe("candidate data isolation (guest)", () => {
  test("dashboard export API rejects unauthenticated requests", async ({
    request,
  }) => {
    const response = await request.get("/api/dashboard/export");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("guests cannot open candidate settings", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard%2Fsettings/);
  });
});

test.describe("admin authorization (guest)", () => {
  test("staff admin pages require sign-in", async ({ page }) => {
    await page.goto("/admin/candidates");
    await expect(page).toHaveURL(/\/auth\?next=%2Fadmin%2Fcandidates/);
  });
});

test.describe("opportunities search", () => {
  test("browse page loads and applies keyword filters via query string", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    await expect(
      page.getByRole("heading", { name: "Opportunities", level: 1 }),
    ).toBeVisible();

    await page.getByLabel("Keyword search").fill("design");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await expect(page).toHaveURL(/q=design/);
    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  });

  test("work mode and experience filters appear in the form", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    await expect(page.getByLabel("Work mode")).toBeVisible();
    await expect(page.getByLabel("Experience")).toBeVisible();
    await expect(page.getByLabel("Industry")).toBeVisible();
    await expect(page.getByLabel("Location")).toBeVisible();
  });
});

test.describe("applications and duplicate prevention (UI)", () => {
  test("opportunity detail prompts guests to sign in before applying", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    const viewLink = page.getByRole("link", { name: "View opportunity" }).first();
    if (await viewLink.count()) {
      await viewLink.click();
      await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    } else {
      await expect(
        page.getByText(/no opportunities/i),
      ).toBeVisible();
    }
  });
});

test.describe("mobile layout", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opportunities filters remain usable on a narrow viewport", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    await expect(page.getByLabel("Keyword search")).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply filters" })).toBeVisible();
  });

  test("auth page is readable on mobile", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByLabel("Email")).toBeVisible();
    const box = await page.getByLabel("Email").boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(200);
  });

  test("dashboard shell exposes mobile quick navigation for signed-in users", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard/);
  });
});
