import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * Touch devices report `hover: none`, so the `@media (hover: hover) and
 * (pointer: fine)` gate must NOT reveal color on a simulated hover here —
 * this is the whole reason the gate exists (a muted button that "stuck"
 * revealed on a touch device would never desaturate again on a phone).
 * See button-muted.desktop.spec.ts for the positive case.
 */
test('ty-button[muted] — hover does NOT reveal color on a touch device', async ({ page }) => {
  await mount(
    page,
    `
    <ty-button id="muted" flavor="success" appearance="outlined" muted>A</ty-button>
  `,
  )
  await page.waitForTimeout(500)

  const before = await page.locator('#muted button').evaluate((el) => getComputedStyle(el).color)
  await page.locator('#muted button').hover()
  await page.waitForTimeout(500)
  const after = await page.locator('#muted button').evaluate((el) => getComputedStyle(el).color)

  expect(after, 'touch/coarse pointers should never get the hover reveal').toEqual(before)
})
