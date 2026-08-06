import { test, expect } from '@playwright/test'
import { mount } from './helpers'

/**
 * `muted` collapses a button to neutral at rest and reveals its real flavor
 * on interaction. Assertions compare against a live sibling button rather
 * than hardcoded colors, so they hold regardless of the active brand seed:
 *   - muted-at-rest should read the SAME as a real `flavor="neutral"` button
 *   - muted-on-:active should read the SAME as the unmuted flavor at rest
 */

// Resolve to actual sRGB pixels via a canvas fillStyle round-trip. Chromium
// can serialize a relative-color-derived value (oklch(from ...)) as oklab()
// even when it resolves to the exact same color as a literal oklch() — so
// comparing raw getComputedStyle() text is unreliable; compare pixels.
const rgb = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
    const toRGB = (c: string) => {
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillStyle = '#000'
      ctx.fillStyle = c
      ctx.fillRect(0, 0, 1, 1)
      return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
    }
    const cs = getComputedStyle(el)
    return { bg: toRGB(cs.backgroundColor), color: toRGB(cs.color), border: toRGB(cs.borderColor) }
  })

test.describe('ty-button[muted] — rest state collapses to neutral', () => {
  for (const appearance of ['solid', 'outlined', 'ghost'] as const) {
    test(`${appearance}: muted primary matches a real neutral button`, async ({ page }) => {
      await mount(
        page,
        `
        <ty-button id="muted" flavor="primary" appearance="${appearance}">A</ty-button>
        <ty-button id="neutral" flavor="neutral" appearance="${appearance}">B</ty-button>
        <ty-button id="plain" flavor="primary" appearance="${appearance}">C</ty-button>
      `,
      )
      await page.locator('#muted').evaluate((el) => el.setAttribute('muted', ''))
      // Colors here resolve through a chained CSS custom-property fallback
      // (--_muted-solid-bg etc.) — Chromium needs real time after the
      // attribute change to settle that, not just a transition; a short
      // wait reads a non-deterministic intermediate value (same root cause
      // as the oklch(from ...) settling documented in button-contrast).
      await page.waitForTimeout(500)

      const muted = await rgb(page, '#muted button')
      const neutral = await rgb(page, '#neutral button')
      const plain = await rgb(page, '#plain button')

      expect(muted, 'muted primary should render identically to a neutral button').toEqual(neutral)
      // Solid differs from its real flavor in `bg`; outlined/ghost differ in
      // `color`/`border` (their background stays transparent at rest) — so
      // compare the whole triple rather than assuming which channel carries it.
      expect(muted, 'muted primary should NOT look like the real primary button').not.toEqual(plain)
    })
  }
})

test.describe('ty-button[muted] — :active always reveals the real flavor (works on touch)', () => {
  for (const appearance of ['solid', 'outlined', 'ghost'] as const) {
    test(`${appearance}: pressing a muted danger button reveals danger`, async ({ page }) => {
      await mount(
        page,
        `
        <ty-button id="muted" flavor="danger" appearance="${appearance}">A</ty-button>
        <ty-button id="plain" flavor="danger" appearance="${appearance}">B</ty-button>
      `,
      )
      await page.locator('#muted').evaluate((el) => el.setAttribute('muted', ''))
      await page.waitForTimeout(500)

      const restColor = await rgb(page, '#muted button')

      // Compare pressed-vs-pressed, not pressed-vs-resting: a real
      // pointer-down also matches :hover (the cursor sits over the
      // element), and outlined/ghost apply a hover background tint on top
      // of the revealed color — a button at pure rest never has that tint,
      // so comparing against rest would fail for the wrong reason. One
      // mouse can't hold two buttons down at once, so press-capture-release
      // each in turn rather than concurrently.
      const pressAndCapture = async (id: string) => {
        const btn = page.locator(`#${id} button`)
        const box = (await btn.boundingBox())!
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.down()
        await page.waitForTimeout(500)
        const color = await rgb(page, `#${id} button`)
        await page.mouse.up()
        return color
      }
      const activeColor = await pressAndCapture('muted')
      const plainActive = await pressAndCapture('plain')

      expect(activeColor, 'pressed muted button should match the real (unmuted) flavor, also pressed').toEqual(
        plainActive,
      )
      // Solid reveals via `bg` (text stays white on both a dark neutral and
      // a dark danger fill); outlined/ghost reveal via `color`/`border`
      // (background stays transparent) — compare the whole triple so the
      // right channel is checked regardless of which appearance this is.
      expect(activeColor, 'pressed state should differ from the muted resting state').not.toEqual(restColor)
    })
  }
})

test.describe('ty-button[muted] — tone (+/-) uses the neutral tone, not a flat shade', () => {
  test('solid: muted primary+ and muted primary- render different neutrals', async ({ page }) => {
    await mount(
      page,
      `
      <ty-button id="plus" flavor="primary+" appearance="solid" muted>A</ty-button>
      <ty-button id="minus" flavor="primary-" appearance="solid" muted>B</ty-button>
      <ty-button id="neutral-plus" flavor="neutral+" appearance="solid">C</ty-button>
      <ty-button id="neutral-minus" flavor="neutral-" appearance="solid">D</ty-button>
    `,
    )
    await page.waitForTimeout(500)

    const plus = await rgb(page, '#plus button')
    const minus = await rgb(page, '#minus button')
    const neutralPlus = await rgb(page, '#neutral-plus button')
    const neutralMinus = await rgb(page, '#neutral-minus button')

    expect(plus.bg, 'muted tone-plus should follow neutral-strong').toEqual(neutralPlus.bg)
    expect(minus.bg, 'muted tone-minus should follow neutral-soft').toEqual(neutralMinus.bg)
    expect(plus.bg, 'tone-plus and tone-minus neutrals should be visually distinct').not.toEqual(minus.bg)
  })
})
