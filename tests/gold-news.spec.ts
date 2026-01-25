import { test, expect } from "@playwright/test";

test.describe("Gold Industry News", () => {
  test("should display gold news page", async ({ page }) => {
    await page.goto("/gold-news");

    // Page title should be visible
    await expect(page.locator("h1")).toContainText("Gold Industry News");

    // Subtitle should be visible
    await expect(page.locator("text=Stay updated with mining news")).toBeVisible();
  });

  test("should display stats cards", async ({ page }) => {
    await page.goto("/gold-news");

    // Stats cards should be visible
    await expect(page.locator("text=Total Articles")).toBeVisible();
    await expect(page.locator("text=Ghana News")).toBeVisible();
    await expect(page.locator("text=World News")).toBeVisible();
    await expect(page.locator("text=Today")).toBeVisible();
  });

  test("should have region filter tabs", async ({ page }) => {
    await page.goto("/gold-news");

    // Filter tabs should be present (Tab components)
    await expect(page.locator('[data-slot="tab"]:has-text("All")')).toBeVisible();
    await expect(page.locator('[data-slot="tab"]:has-text("Ghana")')).toBeVisible();
    await expect(page.locator('[data-slot="tab"]:has-text("World")')).toBeVisible();
  });

  test("should filter by Ghana region", async ({ page }) => {
    await page.goto("/gold-news");

    // Click Ghana tab
    await page.click('[data-slot="tab"]:has-text("Ghana")');

    // Wait for URL to update with region parameter
    await page.waitForURL(/region=ghana/, { timeout: 10000 });
  });

  test("should filter by World region", async ({ page }) => {
    await page.goto("/gold-news");

    // Click World tab
    await page.click('[data-slot="tab"]:has-text("World")');

    // Wait for URL to update with region parameter
    await page.waitForURL(/region=world/, { timeout: 10000 });
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/gold-news", { timeout: 60000 });

    // Search input should be visible
    const searchInput = page.locator('input[placeholder="Search news..."]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test("should display info footer", async ({ page }) => {
    await page.goto("/gold-news");

    // Info footer should be visible
    await expect(
      page.locator("text=News is aggregated from various mining industry sources")
    ).toBeVisible();
  });
});

test.describe("Gold News Navigation", () => {
  test("should navigate to gold news from header", async ({ page }) => {
    await page.goto("/");

    // Click Gold News link in header
    await page.click('a:has-text("Gold News")');

    // Should be on gold news page
    await expect(page).toHaveURL("/gold-news");
    await expect(page.locator("h1")).toContainText("Gold Industry News");
  });
});
