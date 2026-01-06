import { test, expect } from '@playwright/test';

test.describe('Profile Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
  });

  test('should display profile setup screen with all required fields', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await expect(fullNameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(continueButton).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await fullNameInput.fill('John Doe');
    await phoneInput.fill('0501234567');
    await emailInput.fill('invalid-email');
    await continueButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
  });

  test('should show validation error for invalid phone number', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await fullNameInput.fill('John Doe');
    await phoneInput.fill('123');
    await emailInput.fill('john@example.com');
    await continueButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
  });

  test('should show validation error for short name', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await fullNameInput.fill('J');
    await phoneInput.fill('0501234567');
    await emailInput.fill('john@example.com');
    await continueButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
  });

  test('should enable continue button only when all required fields are valid', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await expect(continueButton).toBeDisabled();

    await fullNameInput.fill('John Doe');
    await expect(continueButton).toBeDisabled();

    await phoneInput.fill('0501234567');
    await expect(continueButton).toBeDisabled();

    await emailInput.fill('john@example.com');
    await expect(continueButton).toBeEnabled();
  });

  test('should show loading state during profile submission', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await fullNameInput.fill('John Doe');
    await phoneInput.fill('0501234567');
    await emailInput.fill('john@example.com');
    await continueButton.click();

    const loadingButton = page.getByRole('button', { name: /loading/i });
    await expect(loadingButton).toBeVisible();
  });

  test('should display error alert with retry option on profile submission failure', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await fullNameInput.fill('John Doe');
    await phoneInput.fill('0501234567');
    await emailInput.fill('john@example.com');
    await continueButton.click();

    const errorAlert = page.getByRole('alert');
    const retryButton = page.getByLabel('Retry button');

    await expect(errorAlert).toBeVisible();
    await expect(retryButton).toBeVisible();
  });

  test('should navigate through all profile setup steps', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await fullNameInput.fill('John Doe');
    await phoneInput.fill('0501234567');
    await emailInput.fill('john@example.com');
    await continueButton.click();

    const progressChips = page.locator('[role="progressbar"]');
    await expect(progressChips).toBeVisible();
  });

  test('should have proper accessibility labels on all interactive elements', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const phoneInput = page.getByLabel('Phone number input');
    const emailInput = page.getByLabel('Email');
    const continueButton = page.getByRole('button', { name: /continue/i });

    await expect(fullNameInput).toHaveAttribute('aria-label');
    await expect(phoneInput).toHaveAttribute('aria-label');
    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(continueButton).toHaveAttribute('aria-label');
  });
});
