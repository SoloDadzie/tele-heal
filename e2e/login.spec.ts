import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
    await page.waitForLoadState('networkidle');
  });

  test('should display login screen with all required fields', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');

    await expect(phoneInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(loginButton).toBeVisible();
  });

  test('should show validation error for invalid phone number', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const loginButton = page.getByLabel('Login button');

    await phoneInput.fill('123');
    await loginButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Validation Error');
  });

  test('should show validation error for weak password', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');

    await phoneInput.fill('0501234567');
    await passwordInput.fill('weak');
    await loginButton.click();

    const errorAlert = page.getByRole('alert');
    await expect(errorAlert).toBeVisible();
  });

  test('should enable login button only when all fields are filled', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');

    await expect(loginButton).toBeDisabled();

    await phoneInput.fill('0501234567');
    await expect(loginButton).toBeDisabled();

    await passwordInput.fill('SecurePass123!');
    await expect(loginButton).toBeEnabled();
  });

  test('should show loading state during login', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');

    await phoneInput.fill('0501234567');
    await passwordInput.fill('SecurePass123!');
    await loginButton.click();

    const loadingButton = page.getByRole('button', { name: /loading/i });
    await expect(loadingButton).toBeVisible();
  });

  test('should display error alert with retry option on login failure', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');

    await phoneInput.fill('0501234567');
    await passwordInput.fill('SecurePass123!');
    await loginButton.click();

    const errorAlert = page.getByRole('alert');
    const retryButton = page.getByLabel('Retry button');

    await expect(errorAlert).toBeVisible();
    await expect(retryButton).toBeVisible();
  });

  test('should dismiss error alert when dismiss button is clicked', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');

    await phoneInput.fill('0501234567');
    await passwordInput.fill('SecurePass123!');
    await loginButton.click();

    const errorAlert = page.getByRole('alert');
    const dismissButton = page.getByLabel('Dismiss error');

    await expect(errorAlert).toBeVisible();
    await dismissButton.click();
    await expect(errorAlert).not.toBeVisible();
  });

  test('should have proper accessibility labels on all interactive elements', async ({ page }) => {
    const phoneInput = page.getByLabel('Phone number input');
    const passwordInput = page.getByLabel('Password input');
    const loginButton = page.getByLabel('Login button');
    const countrySelector = page.getByLabel('Select country');

    await expect(phoneInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-label');
    await expect(loginButton).toHaveAttribute('aria-label');
    await expect(countrySelector).toHaveAttribute('aria-label');
  });

  test('should allow country selection from phone number field', async ({ page }) => {
    const countrySelector = page.getByLabel('Select country');
    await countrySelector.click();

    const nigeriaOption = page.getByRole('radio', { name: /Nigeria/i });
    await expect(nigeriaOption).toBeVisible();
    await nigeriaOption.click();

    const dialCode = page.getByLabel('Country dial code');
    await expect(dialCode).toContainText('+234');
  });
});
