import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression (snapshot) tests for the design system's Storybook.
 *
 * Phase 1: scaffold only — this suite is intentionally EMPTY of real
 * per-story specs (see smoke.spec.ts, which just proves Playwright wires
 * up to the built Storybook). Real per-story `toHaveScreenshot` specs land
 * in Phase 3, once components have stable stories to snapshot.
 *
 * Deterministic-render settings below are copied from the merchant-portal
 * design system's proven Playwright config (software GL, disabled font
 * hinting/antialiasing, disabled animations/caret, tight screenshot
 * tolerance) so that future baselines are stable across runs.
 *
 * Baselines (once they exist) are platform-scoped via snapshotPathTemplate
 * so darwin/linux don't clobber each other's screenshots — CI must run on
 * the same OS the baselines were generated on.
 */
const PORT = 4599;

export default defineConfig({
  testDir: '.',
  // Baselines are committed; laid out per-platform so darwin/linux don't collide.
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 0 retries: a snapshot is either stable or it's a determinism bug to fix,
  // not something to paper over with a retry.
  retries: 0,
  // Baselines are only WRITTEN when the worker passes --update-snapshots (which
  // resolves to 'changed' in Playwright 1.61 -- i.e. anything but 'none'); with
  // 'none' a missing baseline makes the per-component test skip (see
  // components.spec.ts) so CI stays green for not-yet-generated components, while
  // a PRESENT baseline is compared (the regression gate).
  updateSnapshots: 'none',
  reporter: [['html', { open: 'never' }], ['list']],

  expect: {
    timeout: 20_000,
    toHaveScreenshot: {
      // Small tolerance against non-deterministic text rasterization
      // (Skia/antialiasing): threshold 0.2 means a pixel only counts as
      // "different" once its color differs by >20%; maxDiffPixels 50 is
      // the budget for edge noise. A real regression is hundreds+ pixels,
      // so it will not slip under this tolerance.
      threshold: 0.2,
      maxDiffPixels: 50,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },

  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
        // Deterministic render for a tight diff tolerance: software GL plus
        // disabled hinting/subpixel antialiasing removes the "wandering"
        // 1px of text antialiasing between runs/machines.
        launchOptions: {
          args: [
            '--disable-gpu',
            '--force-color-profile=srgb',
            '--font-render-hinting=none',
            '--disable-skia-runtime-opts',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text',
          ],
        },
      },
    },
  ],

  // Builds the component library's Storybook into a static bundle and
  // serves it, so tests run against the same artifact CI ships. Runs from
  // the repo root (two levels up from this config) so the pnpm filter and
  // static path both resolve regardless of playwright's own cwd default.
  webServer: {
    command:
      'corepack pnpm -F @d-2-g-8/design-system build-storybook && npx http-server packages/components/storybook-static -p 4599 -s -a localhost',
    cwd: '../..',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
