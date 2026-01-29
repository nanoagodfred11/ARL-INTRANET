import { test, expect } from "@playwright/test";

test.describe("AI Chat Widget", () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/", { timeout: 60000 });
  });

  test("should display chat button on homepage", async ({ page }) => {
    // Chat button should be visible
    const chatButton = page.locator('button[aria-label="Open chat"]');
    await expect(chatButton).toBeVisible();
  });

  test("should open chat widget when button is clicked", async ({ page }) => {
    // Click chat button
    await page.click('button[aria-label="Open chat"]');

    // Wait for chat to open - check for chat container or input field
    // Input might have different placeholder or use textarea
    const chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"], input[type="text"]').first();
    const chatContainer = page.locator('[class*="chat"]').first();

    const hasInput = await chatInput.isVisible({ timeout: 5000 }).catch(() => false);
    const hasContainer = await chatContainer.isVisible({ timeout: 5000 }).catch(() => false);

    expect(hasInput || hasContainer).toBeTruthy();
  });

  test("should show suggested prompts initially", async ({ page }) => {
    await page.click('button[aria-label="Open chat"]');

    // Wait for chat to load and check for suggested prompts or welcome message
    const hasTriAsking = await page.locator("text=Try asking:").isVisible().catch(() => false);
    const hasSuggestion = await page.locator("text=Safety Manager").isVisible().catch(() => false);
    const hasWelcome = await page.locator("text=Hello").isVisible().catch(() => false);
    const hasHelp = await page.locator("text=help").first().isVisible().catch(() => false);

    // At least one of these should be visible when chat opens
    expect(hasTriAsking || hasSuggestion || hasWelcome || hasHelp).toBeTruthy();
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
