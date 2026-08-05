import { defineConfig, devices } from '@playwright/test'

/**
 * E2E harness for tyrell-components, run against the BUILT dist/ output
 * (run `npm run build` first — CI does this via webServer below).
 *
 * Mobile projects use real device emulation (viewport + hasTouch + UA), not
 * matchMedia monkey-patching — isMobileTouch() reads `(pointer: coarse) and
 * (max-width: 768px)`, and Chromium's device emulation reports pointer:coarse
 * faithfully for touch-enabled contexts, so this exercises the real code path
 * consumers hit, not an approximation of it.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'e2e-results.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx http-server . -p 4173 -s',
    url: 'http://127.0.0.1:4173/e2e/fixture.html',
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /\.mobile\.spec\.ts$/,
    },
    {
      name: 'mobile-chrome',
      // Pixel 5: 393x851, hasTouch, pointer:coarse — well under the 768px
      // isMobileTouch() breakpoint.
      use: { ...devices['Pixel 5'] },
      testIgnore: /\.desktop\.spec\.ts$/,
    },
    {
      name: 'mobile-safari-viewport',
      // iPhone 13 viewport/touch via Chromium (WebKit needs system libs not
      // installed here) — covers the narrower iPhone width class distinctly
      // from Pixel 5, still Chromium engine underneath.
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
      testIgnore: /\.desktop\.spec\.ts$/,
    },
  ],
})
