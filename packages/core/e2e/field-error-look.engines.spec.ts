import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

// A non-empty `error` makes ty-input, ty-select and ty-date-picker look
// exactly like flavor="danger" (with the same error) whatever the author's
// flavor: built-in, +/- shade, neutral or custom (its sheet is adopted after
// the built-in one). Real theme CSS and a real mouse, on every engine.

const FLAVORS = [null, 'neutral', 'success', 'primary+', 'neutral-', 'danger-', 'brand']

type Kind = { name: string; tag: string; box: string; focus: string; icons: string[]; attrs: string; inner: string; opens: boolean }
const OPTION = '<ty-option value="a">A</ty-option>'
// icons: the flavor-colored ones that show (a hidden one can read stale in WebKit)
const KINDS: Kind[] = [
  { name: 'ty-input', tag: 'ty-input', box: '.input-wrapper', focus: 'input', icons: [], attrs: ' value="v"', inner: '', opens: false },
  {
    name: 'ty-select', tag: 'ty-select', box: '.select-stub', focus: '.select-stub', icons: [],
    attrs: ' not-searchable value="a"', inner: OPTION, opens: true,
  },
  {
    name: 'ty-select compact', tag: 'ty-select', box: '.select-stub', focus: '.select-stub', icons: ['.select-count'],
    attrs: ' compact multiple not-searchable value="a"', inner: OPTION, opens: true,
  },
  {
    name: 'ty-date-picker', tag: 'ty-date-picker', box: '.date-picker-stub', focus: '.date-picker-stub', icons: ['.stub-arrow'],
    attrs: ' value="2026-06-09"', inner: '', opens: true,
  },
]

// --ty-local-transition: the theme's own switch, so a state reads settled
const PAGE_STYLE = `<style>
  :root {
    --ty-local-transition: 0s;
    --ty-color-brand: rgb(10, 120, 200);
    --ty-color-brand-soft: rgb(120, 180, 230);
    --ty-color-brand-strong: rgb(5, 60, 100);
  }
  .ov {
    --input-accent: rgb(1, 2, 3); --input-accent-bold: rgb(4, 5, 6); --input-ring: rgb(7, 8, 9);
    --select-accent: rgb(1, 2, 3); --select-accent-bold: rgb(4, 5, 6); --select-ring: rgb(7, 8, 9);
    --date-picker-accent: rgb(1, 2, 3); --date-picker-accent-bold: rgb(4, 5, 6); --date-picker-ring: rgb(7, 8, 9);
  }
</style>`

// required (the mark's color is part of the look) with a value: validation stays out of it
const field = (k: Kind, id: string, flavor: string | null, attrs = '') =>
  `<${k.tag} id="${id}" label="Field" required${flavor === null ? '' : ` flavor="${flavor}"`}${k.attrs}${attrs}>${k.inner}</${k.tag}>`

/** Border (all sides), background, ring, the flavor-colored icons, the required mark and an open date-picker's selected day. */
const look = (page: Page, id: string, k: Kind) =>
  page.evaluate(({ id, k }) => {
    const root = document.getElementById(id)!.shadowRoot!
    const box = getComputedStyle(root.querySelector(k.box)!)
    const colors = (sel: string) => {
      const el = root.querySelector(sel)
      if (!el) return `${sel} -`
      const s = getComputedStyle(el)
      return `${sel} ${s.color} ${s.backgroundColor}`
    }
    const day = root.querySelector('dialog[open] ty-calendar')?.shadowRoot?.querySelector('ty-calendar-month')?.shadowRoot?.querySelector('.selected')
    const s = day && getComputedStyle(day)
    return [
      `border ${box.borderTopColor} ${box.borderRightColor} ${box.borderBottomColor} ${box.borderLeftColor}`,
      `bg ${box.backgroundColor}`,
      `ring ${box.boxShadow}`,
      ...k.icons.map(colors),
      colors('.required-icon'),
      ...(s ? [`calendar day ${s.color} ${s.backgroundColor} ${s.borderTopColor}`] : []),
    ].join(' | ')
  }, { id, k })

/** Blur what really has focus: in Firefox a host's blur() leaves its shadow's focus alone. */
const blur = (page: Page) =>
  page.evaluate(() => {
    let el = document.activeElement as HTMLElement | null
    while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement
    el?.blur()
  })

const isOpen = (page: Page, id: string) =>
  page.evaluate((id) => !!document.getElementById(id)!.shadowRoot!.querySelector('dialog[open]'), id)

/** The field at rest, hovered, focused and (select, date-picker) open. */
async function states(page: Page, id: string, k: Kind, touch: boolean) {
  const out = [`rest ${await look(page, id, k)}`]
  if (!touch) {
    await page.locator(`#${id} ${k.box}`).hover()
    out.push(`hover ${await look(page, id, k)}`)
    await page.mouse.move(0, 0)
  }
  await page.evaluate(({ id, sel }) => (document.getElementById(id)!.shadowRoot!.querySelector(sel) as HTMLElement).focus(), { id, sel: k.focus })
  out.push(`focused ${await look(page, id, k)}`)
  await blur(page)
  if (k.opens && !touch) {
    await page.locator(`#${id} ${k.box}`).click()
    await expect.poll(() => isOpen(page, id)).toBe(true)
    if (k.tag === 'ty-date-picker') await expect.poll(async () => (await look(page, id, k)).includes('calendar day')).toBe(true)
    out.push(`open ${await look(page, id, k)}`)
    await page.keyboard.press('Escape')
    await expect.poll(() => isOpen(page, id)).toBe(false)
    await page.mouse.move(0, 0)
    // ty-date-picker ignores a click within 300 ms of a close
    await page.waitForTimeout(350)
    await blur(page)
  }
  return out.join(' || ')
}

const setError = (page: Page, id: string, error: string) =>
  page.evaluate(async ({ id, error }) => {
    (document.getElementById(id) as any).error = error
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  }, { id, error })

const hostState = (page: Page, id: string) =>
  page.evaluate((id) => {
    const el = document.getElementById(id) as any
    // ty-date-picker writes the popup position on style when it opens
    const names = el.getAttributeNames().filter((a: string) => a !== 'error' && a !== 'style').sort().join()
    return `${names} | flavor=${el.getAttribute('flavor')} | el.flavor=${el.flavor}`
  }, id)

for (const k of KINDS) {
  test.describe(`${k.name}: error beats every flavor`, () => {
    test('any flavor + error looks like flavor="danger" + error in every state; cleared, the flavor look is back', async ({ page }, info) => {
      test.setTimeout(180_000)
      const touch = !!info.project.use.hasTouch
      await mount(page, PAGE_STYLE + field(k, 'danger', 'danger', ' error="x"') + field(k, 'plain', null) +
        FLAVORS.map((f, i) => field(k, `own-${i}`, f) + field(k, `err-${i}`, f)).join(''))

      const danger = await states(page, 'danger', k, touch)
      const plain = await states(page, 'plain', k, touch)
      const [rest, hover] = plain.split(' || ')
      if (!touch) expect(hover.replace('hover', ''), 'the probe sees the hover').not.toBe(rest.replace('rest', ''))

      for (const [i, flavor] of FLAVORS.entries()) {
        const own = await states(page, `own-${i}`, k, touch)
        expect(own, `${flavor}: its own look is not danger's`).not.toBe(danger)
        const before = await hostState(page, `err-${i}`)
        await setError(page, `err-${i}`, 'Taken')
        expect(await states(page, `err-${i}`, k, touch), `${flavor} + error`).toBe(danger)
        expect(await hostState(page, `err-${i}`), `${flavor}: nothing written on the host`).toBe(before)
        await setError(page, `err-${i}`, '')
        expect(await states(page, `err-${i}`, k, touch), `${flavor}: error cleared`).toBe(own)
        expect(await hostState(page, `err-${i}`)).toBe(before)
      }
    })

    test('any flavor: a page-level accent override shows on the error as on flavor="danger"', async ({ page }, info) => {
      test.setTimeout(180_000)
      const touch = !!info.project.use.hasTouch
      await mount(page, PAGE_STYLE + field(k, 'danger', 'danger', ' class="ov" error="x"') +
        FLAVORS.map((f, i) => field(k, `err-${i}`, f, ' class="ov" error="x"')).join(''))
      const danger = await states(page, 'danger', k, touch)
      expect(danger.startsWith('rest border rgb(1, 2, 3)'), 'the override is the resting border').toBe(true)
      for (const [i, flavor] of FLAVORS.entries()) {
        expect(await states(page, `err-${i}`, k, touch), String(flavor)).toBe(danger)
      }
    })

    test('any flavor: disabled with an error looks like flavor="danger" disabled, no red tint', async ({ page }) => {
      await mount(page, PAGE_STYLE + field(k, 'danger', 'danger', ' disabled') + field(k, 'danger-err', 'danger', ' disabled error="x"') +
        FLAVORS.map((f, i) => field(k, `err-${i}`, f, ' disabled error="x"')).join(''))
      const danger = await look(page, 'danger', k)
      expect(await look(page, 'danger-err', k), 'flavor="danger" with the error').toBe(danger)
      for (const [i, flavor] of FLAVORS.entries()) {
        expect(await look(page, `err-${i}`, k), String(flavor)).toBe(danger)
      }
    })
  })
}
