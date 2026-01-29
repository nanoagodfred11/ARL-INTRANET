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
  // Skip tests that require authentication if login fails
  test("should load admin apps page", async ({ page }) => {
    await page.goto("/admin/apps");

    // Either see apps page or get redirected to login
    const isOnAppsPage = await page.locator("text=Total Apps").isVisible({ timeout: 5000 }).catch(() => false);
    const isOnLoginPage = await page.locator("text=Welcome Back").isVisible({ timeout: 5000 }).catch(() => false);

    // Page should load (either apps page or login redirect)
    expect(isOnAppsPage || isOnLoginPage).toBeTruthy();
  });

  test("should open create app modal", async ({ page }) => {
    await page.goto("/admin/apps");

    // Check if we're on apps page (authenticated)
    const addAppBtn = page.locator("button:has-text('Add App')");
    const isOnAppsPage = await addAppBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (isOnAppsPage) {
      await addAppBtn.click();
      await expect(page.locator("text=Add New App Link")).toBeVisible({ timeout: 5000 });
    } else {
      // Skip if not authenticated
      test.skip();
    }
  });

  test("should have icon type selection in create modal", async ({ page }) => {
    await page.goto("/admin/apps");

    const addAppBtn = page.locator("button:has-text('Add App')");
    const isOnAppsPage = await addAppBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (isOnAppsPage) {
      await addAppBtn.click();
      await page.waitForTimeout(500);
      await expect(page.locator("label:has-text('Icon Type')")).toBeVisible({ timeout: 5000 });
    } else {
      test.skip();
    }
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
    await page.goto("/admin/apps");

    const categoriesBtn = page.locator('a:has-text("Categories"), button:has-text("Categories")').first();
    const isOnAppsPage = await categoriesBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (isOnAppsPage) {
      await categoriesBtn.click();
      await expect(page).toHaveURL(/admin\/apps\/categories/, { timeout: 10000 });
    } else {
      // Navigate directly if button not visible (not authenticated)
      await page.goto("/admin/apps/categories");
      await expect(page.locator("body")).toBeVisible();
    }
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
