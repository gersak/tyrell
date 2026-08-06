import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * Hover-reveal is gated behind `@media (hover: hover) and (pointer: fine)`,
 * so it only applies on real pointer devices — desktop-chrome is the only
 * project that reports hover:hover. See button-muted.mobile.spec.ts for the
 * inverse assertion (touch does NOT reveal on hover).
 */
test('ty-button[muted] — hovering a real pointer reveals the flavor color', async ({ page }) => {
  await mount(
    page,
    `
    <ty-button id="muted" flavor="success" appearance="outlined" muted>A</ty-button>
    <ty-button id="plain" flavor="success" appearance="outlined">B</ty-button>
  `,
  )
  // See button-muted.spec.ts: the muted color chain needs real settle time
  // in Chromium, not just a transition — a short wait reads a
  // non-deterministic intermediate value.
  await page.waitForTimeout(500)

  const toRgb = (el: Element) => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = getComputedStyle(el).color
    ctx.fillRect(0, 0, 1, 1)
    return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
  }

  const before = await page.locator('#muted button').evaluate(toRgb)
  await page.locator('#muted button').hover()
  await page.waitForTimeout(500)
  const after = await page.locator('#muted button').evaluate(toRgb)
  const plainColor = await page.locator('#plain button').evaluate(toRgb)

  expect(after, 'hovering should change the muted button away from its resting neutral').not.toEqual(before)
  expect(after, 'hover color should match the real (unmuted) flavor').toEqual(plainColor)
})
