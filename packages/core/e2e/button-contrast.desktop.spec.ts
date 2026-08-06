import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * Regression coverage for the auto-contrast foreground fix (--ty-solid-*-fg
 * derived from the fill's own lightness instead of hardcoded white).
 * Before the fix: every `flavor-` (tone-minus) solid button failed WCAG AA
 * at every brand hue — worst case 2.53:1. Desktop-only: no touch dependency,
 * one run is enough to catch a regression in the token math.
 */

const FLAVORS = ['primary', 'success', 'danger', 'warning', 'neutral']
const TONES = ['-', '', '+']
// A representative spread, not the full ring — cheap enough for every CI run
// while still covering the hue that broke worst pre-fix (warning-adjacent).
const HUES = [45, 90, 145, 260]

/** WCAG 2.1 relative luminance -> contrast ratio, computed in-page via a
 * canvas fillStyle round-trip so any CSS color function (oklch, etc.)
 * resolves to concrete sRGB before we do the math. */
async function contrastRatio(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    const toRGB = (c: string) => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = c
      ctx.fillRect(0, 0, 1, 1)
      const d = ctx.getImageData(0, 0, 1, 1).data
      return [d[0], d[1], d[2]] as const
    }
    const srgb = (c: number) => {
      c /= 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    const lum = ([r, g, b]: readonly number[]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
    const cs = getComputedStyle(el)
    const [l1, l2] = [lum(toRGB(cs.backgroundColor)), lum(toRGB(cs.color))].sort((a, b) => b - a)
    return (l1 + 0.05) / (l2 + 0.05)
  })
}

test.describe('solid button auto-contrast — WCAG AA across flavors/tones/hues/modes', () => {
  for (const mode of ['light', 'dark'] as const) {
    test(`${mode}: every flavor × tone × sampled hue clears 4.5:1`, async ({ page }) => {
      await mount(
        page,
        FLAVORS.flatMap((f) => TONES.map((t) => `<ty-button flavor="${f}${t}">x</ty-button>`)).join(''),
      )
      if (mode === 'dark') {
        await page.evaluate(() => document.documentElement.classList.add('dark'))
      }
      await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important}' })
      await page.waitForTimeout(50)

      const failures: string[] = []
      for (const hue of HUES) {
        await page.evaluate((h) => document.documentElement.style.setProperty('--ty-brand-hue', String(h)), hue)
        await page.waitForTimeout(60)
        for (const f of FLAVORS) {
          for (const t of TONES) {
            const flavor = `${f}${t}`
            const selector = `ty-button[flavor="${flavor}"] button`
            const ratio = await contrastRatio(page, selector)
            if (ratio < 4.5) failures.push(`hue ${hue} ${flavor}: ${ratio.toFixed(2)}:1`)
          }
        }
      }

      expect(failures, `${failures.length} combination(s) below AA:\n${failures.join('\n')}`).toEqual([])
    })
  }
})

test.describe('ty-wizard step circles — dark mode contrast', () => {
  test('completed/active/error circles clear 4.5:1 in dark mode', async ({ page }) => {
    await mount(
      page,
      `
      <ty-wizard>
        <ty-step id="a" label="A" status="completed">a</ty-step>
        <ty-step id="b" label="B" status="active">b</ty-step>
        <ty-step id="c" label="C" status="error">c</ty-step>
      </ty-wizard>
    `,
    )
    await page.evaluate(() => document.documentElement.classList.add('dark'))
    await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important}' })
    // The step-circle color is oklch(from <accent> clamp(...)) — a relative-
    // color expression nested inside clamp(). Reading it too soon after the
    // dark-mode class toggle catches Chromium mid-resolution and returns
    // wildly wrong (non-deterministic) intermediate values; 500ms reliably
    // settles it (confirmed stable across repeat reads on the same page).
    await page.waitForTimeout(500)

    const failures: string[] = []
    for (const state of ['completed', 'active', 'error']) {
      const ratio = await contrastRatio(page, `.step-circle[data-state="${state}"]`)
      if (ratio < 4.5) failures.push(`${state}: ${ratio.toFixed(2)}:1`)
    }
    expect(failures, failures.join('\n')).toEqual([])
  })
})
