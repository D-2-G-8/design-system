import { expect, test } from '@playwright/test';

/**
 * Wiring smoke test only — no `toHaveScreenshot` baseline yet.
 *
 * Proves that Playwright is configured correctly and can talk to the built
 * Storybook served by the `webServer` in playwright.config.ts. Real
 * per-story visual specs (with committed screenshot baselines) land in
 * Phase 3.
 */

test.beforeEach(async ({ page }) => {
  // Fonts are self-hosted in storybook-static/; nothing in this suite should
  // ever need the network, so any external request is a determinism bug.
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
});

test('storybook loads', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);

  await expect(page).toHaveTitle(/Storybook/);
  await expect(page.locator('#storybook-preview-iframe')).toBeVisible();
});
