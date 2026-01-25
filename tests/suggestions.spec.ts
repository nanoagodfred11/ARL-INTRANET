import { test, expect } from "@playwright/test";

test.describe("Anonymous Suggestion Box", () => {
  test("should display suggestion page", async ({ page }) => {
    await page.goto("/suggestions");

    // Page title should be visible
    await expect(page.locator("h1")).toContainText("Suggestion Box");

    // Subtitle should be visible
    await expect(page.locator("text=Share your ideas, feedback, or concerns anonymously")).toBeVisible();
  });

  test("should display privacy assurance message", async ({ page }) => {
    await page.goto("/suggestions");

    // Privacy message should be visible
    await expect(page.locator("text=Your privacy is protected")).toBeVisible();
    await expect(page.locator("text=All suggestions are submitted anonymously")).toBeVisible();
  });

  test("should display suggestion form", async ({ page }) => {
    await page.goto("/suggestions");

    // Form elements should be visible - check for the form structure
    await expect(page.locator('button:has-text("Select a category")')).toBeVisible();
    await expect(page.locator('textarea[name="content"]')).toBeVisible();
    await expect(page.locator('button:has-text("Submit Anonymously")')).toBeVisible();
  });

  test("should have category dropdown", async ({ page }) => {
    await page.goto("/suggestions");

    // Click category dropdown
    const categorySelect = page.locator('button:has-text("Select a category")');
    await expect(categorySelect).toBeVisible();
  });

  test("should have character counter", async ({ page }) => {
    await page.goto("/suggestions");

    // Type in textarea
    const textarea = page.locator('textarea[name="content"]');
    await textarea.fill("This is a test suggestion");

    // Character count should update
    await expect(page.locator("text=/\\d+\\/2000/")).toBeVisible();
  });

  test("should disable submit button when form is incomplete", async ({ page }) => {
    await page.goto("/suggestions");

    // Submit button should be disabled initially
    const submitButton = page.locator('button:has-text("Submit Anonymously")');
    await expect(submitButton).toBeDisabled();
  });

  test("should show minimum character message", async ({ page }) => {
    await page.goto("/suggestions");

    // Type less than minimum characters
    const textarea = page.locator('textarea[name="content"]');
    await textarea.fill("Short");

    // Should show minimum character message
    await expect(page.locator("text=more characters needed")).toBeVisible();
  });

  test("should link to alerts page", async ({ page }) => {
    await page.goto("/suggestions");

    // Safety concern link should be visible
    await expect(page.locator('a[href="/alerts"]')).toBeVisible();
    await expect(page.locator("text=Report it immediately")).toBeVisible();
  });
});
