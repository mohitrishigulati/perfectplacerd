import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/clients",
  "/contact",
  "/privacy",
  "/terms",
  "/opportunities",
];

test.describe("public marketing pages", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} returns 200`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
    });
  }

  test("home shows executive search credibility", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Est. 1992").first()).toBeVisible();
    await expect(page.getByText("Noida · Mumbai · Chennai").first()).toBeVisible();
  });
});

test.describe("authentication", () => {
  test("auth page exposes passwordless email sign-in", async ({ page }) => {
    await page.goto("/auth");
    await expect(
      page.getByRole("heading", { name: /sign in with email/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send sign-in code/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /privacy policy/i })).toBeVisible();
  });

  test("email is required on submit", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: /send sign-in code/i }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Email is required." }),
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
  test("browse page loads without exposing database errors", async ({
    page,
  }) => {
    await page.goto("/opportunities");
    await expect(
      page.getByRole("heading", { name: "Opportunities", level: 1 }),
    ).toBeVisible();
    await expect(page.getByText(/relation .* does not exist/i)).toHaveCount(0);
    await expect(page.getByText(/PGRST/i)).toHaveCount(0);
  });

  test("applies keyword filters via query string", async ({ page }) => {
    await page.goto("/opportunities");
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
        page.getByRole("status").filter({ hasText: /temporarily unavailable/i }).first(),
      ).toBeVisible();
    }
  });
});

test.describe("seo", () => {
  test("robots.txt disallows private areas", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("Disallow: /auth");
    expect(text).toContain("Disallow: /dashboard");
  });

  test("sitemap.xml is reachable", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
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
    await expect(page.getByLabel(/email/i)).toBeVisible();
    const box = await page.getByLabel(/email/i).boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(200);
  });

  test("contact page is readable on mobile", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("dashboard shell redirects guests on mobile", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\?next=%2Fdashboard/);
  });
});
