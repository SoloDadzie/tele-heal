import { test, expect } from '@playwright/test';

test.describe('Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
    
    const signUpLink = page.getByRole('button', { name: /sign up|create account/i });
    await signUpLink.click();
  });

  test('should display sign up screen with all required fields', async ({ page }) => {
    const fullNameInput = page.getByLabel('Full name');
    const emailInput = page.getByLabel('Email');
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await expect(fullNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(createButton).toBeVisible();
  });

  test('should show validation error when passwords do not match', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await phoneInput.fill('0501234567');
    await passwordInput.fill('SecurePass123!');
    await confirmPasswordInput.fill('DifferentPass123!');
    await createButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Validation Error');
  });

  test('should show validation error for weak password', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await phoneInput.fill('0501234567');
    await passwordInput.fill('weak');
    await confirmPasswordInput.fill('weak');
    await createButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
  });

  test('should enable create button only when all fields are valid', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await expect(createButton).toBeDisabled();

    await phoneInput.fill('0501234567');
    await expect(createButton).toBeDisabled();

    await passwordInput.fill('SecurePass123!');
    await expect(createButton).toBeDisabled();

    await confirmPasswordInput.fill('SecurePass123!');
    await expect(createButton).toBeEnabled();
  });

  test('should show loading state during account creation', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await phoneInput.fill('0501234567');
    await passwordInput.fill('SecurePass123!');
    await confirmPasswordInput.fill('SecurePass123!');
    await createButton.click();

    const loadingButton = page.getByRole('button', { name: /loading/i });
    await expect(loadingButton).toBeVisible();
  });

  test('should display error alert with retry option on signup failure', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await phoneInput.fill('0501234567');
    await passwordInput.fill('SecurePass123!');
    await confirmPasswordInput.fill('SecurePass123!');
    await createButton.click();

    const errorAlert = page.getByRole('alert');
    const retryButton = page.getByLabel('Retry button');

    await expect(errorAlert).toBeVisible();
    await expect(retryButton).toBeVisible();
  });

  test('should have proper accessibility labels on all interactive elements', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password');
    const confirmPasswordInput = page.getByLabel('Confirm password');
    const createButton = page.getByRole('button', { name: /create account/i });

    await expect(phoneInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-label');
    await expect(confirmPasswordInput).toHaveAttribute('aria-label');
    await expect(createButton).toHaveAttribute('aria-label');
  });
});
