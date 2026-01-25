import { test, expect } from "@playwright/test";

// Run tests serially to avoid OTP rate limiting conflicts
test.describe.configure({ mode: "serial" });

// Set longer timeout for all tests in this file (OTP cooldown can be 60s)
test.setTimeout(120000);

// Helper to request OTP and handle rate limiting
async function requestOTPWithRetry(page: import("@playwright/test").Page, phone: string) {
  await page.fill("input[name='phone']", phone);
  await page.click("button[type='submit']");

  // Wait for either OTP step or cooldown message
  const result = await Promise.race([
    page.locator("h1:has-text('Verify Your Phone')").waitFor({ timeout: 15000 }).then(() => "otp"),
    page.locator("text=/Please wait \\d+ seconds/").waitFor({ timeout: 15000 }).then(() => "cooldown"),
  ]).catch(() => "error");

  if (result === "cooldown") {
    // Extract wait time and wait
    const cooldownText = await page.locator("text=/Please wait \\d+ seconds/").textContent();
    const match = cooldownText?.match(/(\d+) seconds/);
    if (match) {
      const waitTime = parseInt(match[1], 10) + 1;
      console.log(`Rate limited, waiting ${waitTime} seconds...`);
      await page.waitForTimeout(waitTime * 1000);

      // Retry
      await page.click("button[type='submit']");
      await expect(page.locator("h1")).toContainText("Verify Your Phone", { timeout: 15000 });
    }
  } else if (result === "error") {
    // Check for other error messages
    const errorDiv = page.locator(".bg-red-50");
    if (await errorDiv.isVisible()) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Unexpected error: ${errorText}`);
    }
  }
}

test.describe("Admin Login Flow", () => {
  test("should display login page with phone input", async ({ page }) => {
    await page.goto("/admin/login");

    // Check page elements
    await expect(page.locator("h1")).toContainText("Welcome Back!");
    await expect(page.locator("text=Sign in to access the admin portal")).toBeVisible();

    // Check phone input exists
    const phoneInput = page.locator("input[name='phone']");
    await expect(phoneInput).toBeVisible();

    // Check submit button
    const submitButton = page.locator("button[type='submit']");
    await expect(submitButton).toContainText("Get Verification Code");
  });

  test("should show error for invalid phone number", async ({ page }) => {
    await page.goto("/admin/login");

    // Enter invalid phone
    await page.fill("input[name='phone']", "123");
    await page.click("button[type='submit']");

    // Wait for error message
    await expect(page.locator("text=Invalid Ghana phone number")).toBeVisible({ timeout: 10000 });
  });

  test("should show error for unregistered phone number", async ({ page }) => {
    await page.goto("/admin/login");

    // Enter valid but unregistered phone
    await page.fill("input[name='phone']", "0559999999");
    await page.click("button[type='submit']");

    // Wait for error message
    await expect(page.locator("text=Phone number not registered as admin")).toBeVisible({ timeout: 10000 });
  });

  test("should proceed to OTP step with valid registered phone", async ({ page }) => {
    await page.goto("/admin/login");

    // Request OTP (with rate limit handling)
    await requestOTPWithRetry(page, "0241234567");

    // Verify we're on OTP step
    await expect(page.locator("h1")).toContainText("Verify Your Phone");
    await expect(page.locator("text=Enter the 6-digit code sent to your phone")).toBeVisible();

    // Check phone is displayed
    await expect(page.locator("text=0241234567")).toBeVisible();

    // Check OTP inputs exist (6 inputs)
    const otpInputs = page.locator("input[inputmode='numeric']");
    await expect(otpInputs).toHaveCount(6);

    // Check verify button
    await expect(page.locator("button:has-text('Verify & Sign In')")).toBeVisible();

    // Check change button
    await expect(page.locator("button:has-text('Change')")).toBeVisible();
  });

  test("should allow going back to phone step", async ({ page }) => {
    await page.goto("/admin/login");

    // Request OTP (with rate limit handling)
    await requestOTPWithRetry(page, "0241234567");

    // Verify we're on OTP step
    await expect(page.locator("h1")).toContainText("Verify Your Phone");

    // Click change button
    await page.click("button:has-text('Change')");

    // Should be back at phone step
    await expect(page.locator("h1")).toContainText("Welcome Back!");
  });

  test("should show error for invalid OTP", async ({ page }) => {
    await page.goto("/admin/login");

    // Request OTP (with rate limit handling)
    await requestOTPWithRetry(page, "0241234567");

    // Verify we're on OTP step
    await expect(page.locator("h1")).toContainText("Verify Your Phone");

    // Enter wrong OTP
    const otpInputs = page.locator("input[inputmode='numeric']");
    await otpInputs.nth(0).fill("1");
    await otpInputs.nth(1).fill("2");
    await otpInputs.nth(2).fill("3");
    await otpInputs.nth(3).fill("4");
    await otpInputs.nth(4).fill("5");
    await otpInputs.nth(5).fill("6");

    // Submit
    await page.click("button:has-text('Verify & Sign In')");

    // Should show error
    await expect(page.locator("text=Invalid code")).toBeVisible({ timeout: 10000 });
  });
});
