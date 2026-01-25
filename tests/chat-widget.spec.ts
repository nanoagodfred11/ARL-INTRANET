import { test, expect } from "@playwright/test";

test.describe("AI Chat Widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display chat button on homepage", async ({ page }) => {
    // Chat button should be visible
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();
  });

  test("should open chat widget when button is clicked", async ({ page }) => {
    // Click chat button
    await page.click('button[aria-label="Open chat"]');

    // Wait for chat to open - check for input field
    await expect(page.locator('input[placeholder="Type your message..."]')).toBeVisible();
  });

  test("should show suggested prompts initially", async ({ page }) => {
    await page.click('button[aria-label="Open chat"]');

    // Suggested prompts should be visible
    await expect(page.locator("text=Try asking:")).toBeVisible();
    await expect(page.locator("text=Who is the Safety Manager?")).toBeVisible();
  });

  test("should minimize and maximize chat", async ({ page }) => {
    await page.click('button[aria-label="Open chat"]');

    // Minimize chat
    await page.click('button[aria-label="Minimize"]');

    // Chat input should not be visible when minimized
    await expect(page.locator('input[placeholder="Type your message..."]')).not.toBeVisible();

    // Maximize chat
    await page.click('button[aria-label="Maximize"]');

    // Chat input should be visible again
    await expect(page.locator('input[placeholder="Type your message..."]')).toBeVisible();
  });

  test("should close chat widget", async ({ page }) => {
    await page.click('button[aria-label="Open chat"]');
    await expect(page.locator('input[placeholder="Type your message..."]')).toBeVisible();

    // Close chat
    await page.click('button[aria-label="Close chat"]');

    // Chat widget should be closed, button should be visible
    await expect(page.locator('input[placeholder="Type your message..."]')).not.toBeVisible();
    await expect(page.locator('button[aria-label="Open chat"]')).toBeVisible();
  });

  test("should allow typing a message", async ({ page }) => {
    await page.click('button[aria-label="Open chat"]');

    // Wait for input to appear (with longer timeout)
    const input = page.locator('input[placeholder="Type your message..."]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill("Hello, can you help me?");

    await expect(input).toHaveValue("Hello, can you help me?");
  });
});
