import { test, expect } from "@playwright/test";

test.describe("Apps Page", () => {
  test("should load the public apps page", async ({ page }) => {
    await page.goto("/apps");

    // Check page title
    await expect(page.locator("h1")).toContainText("Company Apps");

    // Check search input exists (specifically the apps search, not header)
    await expect(page.locator("input[name='search']")).toBeVisible();
  });

  test("should display apps or empty state", async ({ page }) => {
    await page.goto("/apps");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Check if there are app cards or empty state message
    const pageContent = await page.content();
    const hasApps = pageContent.includes("click") || pageContent.includes("Category");
    const isEmpty = pageContent.includes("No applications");

    // Either apps should be visible or empty state
    expect(hasApps || isEmpty).toBeTruthy();
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/apps");

    // Use the specific apps search input (has name='search')
    const searchInput = page.locator("input[name='search']");
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill("test");
    await searchInput.press("Enter");

    // URL should update with search param
    await expect(page).toHaveURL(/search=test/);
  });
});

test.describe("Admin Apps Page", () => {
  async function loginAsAdmin(page: import("@playwright/test").Page) {
    await page.goto("/admin/login");
    await page.fill("input[name='phone']", "0244000001");
    await page.click("button[type='submit']");

    // Wait for OTP input to appear
    await page.waitForTimeout(1000);

    // Fill OTP (test OTP)
    const otpInputs = page.locator("input[maxlength='1']");
    const otpCount = await otpInputs.count();
    if (otpCount > 0) {
      for (let i = 0; i < Math.min(otpCount, 6); i++) {
        await otpInputs.nth(i).fill("1");
      }
      await page.click("button[type='submit']");
      await page.waitForTimeout(2000);
    }
  }

  test("should load admin apps page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/apps");

    // Check for stats cards
    await expect(page.locator("text=Total Apps")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Active Apps")).toBeVisible();
    await expect(page.locator("text=Categories")).toBeVisible();

    // Check for Add App button
    await expect(page.locator("button:has-text('Add App')")).toBeVisible();
  });

  test("should open create app modal", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/apps");
    await page.waitForLoadState("networkidle");

    // Click Add App button
    await page.click("button:has-text('Add App')");

    // Modal should open
    await expect(page.locator("text=Add New App Link")).toBeVisible({ timeout: 5000 });

    // Check form fields
    await expect(page.locator("input[name='name']")).toBeVisible();
    await expect(page.locator("input[name='url']")).toBeVisible();
  });

  test("should have icon type selection in create modal", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/apps");
    await page.waitForLoadState("networkidle");

    // Click Add App button
    await page.click("button:has-text('Add App')");
    await page.waitForTimeout(500);

    // Check icon type dropdown exists
    await expect(page.locator("label:has-text('Icon Type')")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("label:has-text('Icon')")).toBeVisible();
  });

  test("should display app icons in the table", async ({ page }) => {
    await page.goto("/admin/apps");

    // Wait for table to load
    await page.waitForLoadState("networkidle");

    // Check if table has rows with icon containers
    const iconContainers = page.locator("td .rounded-lg.bg-primary-50");
    const count = await iconContainers.count();

    // If there are apps, they should have icon containers
    if (count > 0) {
      // Each icon container should have an SVG (lucide icon) or img or emoji
      const firstIcon = iconContainers.first();
      const hasSvg = await firstIcon.locator("svg").isVisible().catch(() => false);
      const hasImg = await firstIcon.locator("img").isVisible().catch(() => false);
      const hasEmoji = await firstIcon.locator("span").isVisible().catch(() => false);

      expect(hasSvg || hasImg || hasEmoji).toBeTruthy();
    }
  });

  test("should navigate to categories page", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/apps");
    await page.waitForLoadState("networkidle");

    // Click Categories button (could be button or link)
    const categoriesBtn = page.locator("text=Categories").first();
    await categoriesBtn.click();

    // Should navigate to categories page
    await expect(page).toHaveURL(/admin\/apps\/categories/, { timeout: 10000 });
  });
});

test.describe("Apps Icon Rendering", () => {
  test("public apps page renders without errors", async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/apps");
    await page.waitForLoadState("networkidle");

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );

    // Should have no critical JS errors related to icons
    const iconErrors = criticalErrors.filter(
      (e) => e.toLowerCase().includes("icon") || e.includes("is not defined")
    );
    expect(iconErrors).toHaveLength(0);
  });

  test("admin apps page renders without icon errors", async ({ page }) => {
    // Login first
    await page.goto("/admin/login");
    await page.fill("input[name='phone']", "0244000001");
    await page.click("button[type='submit']");

    await page.waitForURL(/admin\/login/);
    const otpInputs = page.locator("input[maxlength='1']");
    const otpCount = await otpInputs.count();
    if (otpCount > 0) {
      for (let i = 0; i < Math.min(otpCount, 6); i++) {
        await otpInputs.nth(i).fill("1");
      }
      await page.click("button[type='submit']");
      await page.waitForURL(/admin(?!\/login)/);
    }

    // Listen for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/admin/apps");
    await page.waitForLoadState("networkidle");

    // Filter and check for icon-related errors
    const iconErrors = errors.filter(
      (e) => e.toLowerCase().includes("icon") || e.includes("is not defined")
    );
    expect(iconErrors).toHaveLength(0);
  });
});
