import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");

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
    await page.click('a:has-text("News")');
    await expect(page).toHaveURL("/news");
  });

  test("should navigate to safety page", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Safety")');
    await expect(page).toHaveURL("/safety");
  });

  test("should navigate to directory page", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Directory")');
    await expect(page).toHaveURL("/directory");
  });

  test("should navigate to events page", async ({ page }) => {
    await page.goto("/");
    await page.click('header a[href="/events"]');
    await expect(page).toHaveURL("/events");
  });

  test("should navigate to apps page", async ({ page }) => {
    await page.goto("/");
    await page.click('a:has-text("Apps")');
    await expect(page).toHaveURL("/apps");
  });
});

test.describe("Footer", () => {
  test("should display footer", async ({ page }) => {
    await page.goto("/");

    // Footer should be visible
    await expect(page.locator("footer")).toBeVisible();
  });
});
