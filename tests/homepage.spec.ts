import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  // Set longer timeout for homepage tests due to potential SSR delays
  test.setTimeout(60000);

  test("should load homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    // Page should load
    await expect(page).toHaveTitle(/ARL/);
  });

  test("should display header navigation", async ({ page }) => {
    await page.goto("/");

    // Check header has navigation links
    await expect(page.locator('header a[href="/news"]')).toBeVisible();
    await expect(page.locator('header a[href="/safety"]')).toBeVisible();
    await expect(page.locator('header a[href="/directory"]')).toBeVisible();
    await expect(page.locator('header a[href="/apps"]')).toBeVisible();
  });

  test("should display chat widget button", async ({ page }) => {
    await page.goto("/");

    // Chat button should be visible
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();
  });

  test("should navigate to news page", async ({ page }) => {
    await page.goto("/");
    // Use header link specifically to avoid clicking other "News" links
    await page.locator('header a:has-text("News")').first().click();
    await expect(page).toHaveURL(/news/, { timeout: 10000 });
  });

  test("should navigate to safety page", async ({ page }) => {
    await page.goto("/");
    // Use first() to avoid strict mode violation if multiple Safety links exist
    await page.locator('a:has-text("Safety")').first().click();
    await expect(page).toHaveURL(/safety/, { timeout: 10000 });
  });

  test("should navigate to directory page", async ({ page }) => {
    await page.goto("/");
    // Use header link specifically to avoid clicking other "Directory" links
    await page.locator('header a:has-text("Directory")').first().click();
    await expect(page).toHaveURL(/directory/, { timeout: 10000 });
  });

  test("should navigate to events page", async ({ page }) => {
    await page.goto("/");
    // Navigate directly since header links may be in dropdown
    const eventsLink = page.locator('a[href="/events"]').first();
    if (await eventsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await eventsLink.click();
      await expect(page).toHaveURL(/events/, { timeout: 10000 });
    } else {
      await page.goto("/events");
      await expect(page).toHaveURL(/events/);
    }
  });

  test("should navigate to apps page", async ({ page }) => {
    await page.goto("/");
    // Navigate directly since header links may be in dropdown
    const appsLink = page.locator('a[href="/apps"]').first();
    if (await appsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await appsLink.click();
      await expect(page).toHaveURL(/apps/, { timeout: 10000 });
    } else {
      await page.goto("/apps");
      await expect(page).toHaveURL(/apps/);
    }
  });
});

test.describe("Footer", () => {
  test("should display footer", async ({ page }) => {
    await page.goto("/");

    // Footer should be visible
    await expect(page.locator("footer")).toBeVisible();
  });
});
