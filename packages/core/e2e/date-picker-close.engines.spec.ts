import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * The picker's popup closed by someone else, and the × on touch devices, on
 * every engine. A ty-modal closing closes the calendar still open inside it:
 * the picker must let go of its scroll lock and say aria-expanded="false"
 * right away, without pulling the focus onto its stub, now hidden in the
 * closed modal. On touch devices the × hides itself when it clears: the focus
 * goes to the native input instead of falling to <body>.
 */

const MODAL = `
  <button id="opener" type="button">open</button>
  <ty-modal id="m">
    <div style="width: 360px; padding: 24px;">
      <ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>
    </div>
  </ty-modal>`

/** Class (or id/tag) of the deepest focused element, through shadow roots. */
const deepFocus = (page: Page) =>
  page.evaluate(() => {
    let a: Element | null = document.activeElement
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
    return a ? (a.id || a.className || a.tagName.toLowerCase()) : ''
  })

const calendarOpen = (page: Page) =>
  page.evaluate(() => (document.getElementById('dp')!.shadowRoot!.querySelector('.calendar-dialog') as HTMLDialogElement).open)

async function openCalendarInModal(page: Page) {
  await mount(page, MODAL)
  await page.locator('#opener').focus()
  await page.evaluate(() => { (document.getElementById('m') as any).open = true })
  await page.locator('#dp .date-picker-stub').click()
  await expect.poll(() => calendarOpen(page)).toBe(true)
}

test.describe('ty-date-picker in a ty-modal: the modal closes with the calendar open', () => {
  for (const how of ['open = false', 'hide()']) {
    test(`modal ${how}: lock released, aria-expanded false, focus back on the opener`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'mobile uses the native date input, no popup calendar')
      await openCalendarInModal(page)

      // Read in the same task: no waiting for the dialog's async `close` event
      const now = await page.evaluate(async (how) => {
        const m = document.getElementById('m') as any
        if (how === 'hide()') m.hide()
        else m.open = false
        await Promise.resolve()
        const stub = document.getElementById('dp')!.shadowRoot!.querySelector('.date-picker-stub')!
        return {
          locked: document.documentElement.classList.contains('ty-scroll-locked'),
          expanded: stub.getAttribute('aria-expanded'),
        }
      }, how)
      expect(now).toEqual({ locked: false, expanded: 'false' })

      expect(await calendarOpen(page)).toBe(false)
      await expect.poll(() => deepFocus(page)).toBe('opener')
    })
  }

  test('Escape: the calendar first, then the modal; aria-expanded false throughout', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mobile uses the native date input, no popup calendar')
    await openCalendarInModal(page)
    const expanded = () => page.locator('#dp .date-picker-stub').getAttribute('aria-expanded')

    await page.keyboard.press('Escape')
    await expect.poll(() => calendarOpen(page)).toBe(false)
    expect(await expanded()).toBe('false')
    expect(await deepFocus(page)).toBe('date-picker-stub')

    await page.keyboard.press('Escape')
    await expect.poll(() => page.evaluate(() => document.getElementById('m')!.hasAttribute('open'))).toBe(false)
    expect(await page.evaluate(() => document.documentElement.classList.contains('ty-scroll-locked'))).toBe(false)
    expect(await expanded()).toBe('false')
    await expect.poll(() => deepFocus(page)).toBe('opener')
  })
})

test.describe('ty-date-picker on a touch device: clearing with ×', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  for (const attrs of ['value="2026-07-15"', 'with-time value="2026-07-15T10:30"']) {
    test(`keeps the focus on the field (${attrs})`, async ({ page }) => {
      await mount(page, `<ty-date-picker id="dp" ${attrs}></ty-date-picker>`)
      await expect(page.locator('#dp .native-date-input')).toBeAttached()

      await page.locator('#dp .stub-clear').tap()
      await expect.poll(() => page.evaluate(() => (document.getElementById('dp') as any).value)).toBe(null)
      await expect.poll(() => deepFocus(page)).toBe('native-date-input')
    })
  }

  test('leaves the focus where the change handler moved it', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker><input id="next">`)
    await page.evaluate(() => {
      document.getElementById('dp')!.addEventListener('change', (e: any) => {
        if (e.detail.source === 'clear') document.getElementById('next')!.focus()
      })
    })
    await expect(page.locator('#dp .native-date-input')).toBeAttached()

    await page.locator('#dp .stub-clear').tap()
    await expect.poll(() => page.evaluate(() => (document.getElementById('dp') as any).value)).toBe(null)
    await page.waitForTimeout(100)
    expect(await deepFocus(page)).toBe('next')
  })
})

// The calendar opens a frame after the click: the picker may be gone by then,
// or hidden in a modal that closed in the same task (a React parent's onClick
// remounting the field runs in that task too).
test.describe('ty-date-picker: the calendar opening a frame late', () => {
  const state = (page: Page) =>
    page.evaluate(() => {
      const dp = document.getElementById('dp')!
      const stub = dp.shadowRoot!.querySelector('.date-picker-stub')
      return {
        locked: document.documentElement.classList.contains('ty-scroll-locked'),
        expanded: stub?.getAttribute('aria-expanded') ?? null,
        calendar: !!(dp.shadowRoot!.querySelector('.calendar-dialog') as HTMLDialogElement | null)?.open,
      }
    })

  test('removed in the same task as the click: no lock left', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mobile uses the native date input, no popup calendar')
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`)
    await page.evaluate(() => {
      const dp = document.getElementById('dp')!
      ;(dp.shadowRoot!.querySelector('.date-picker-stub') as HTMLElement).click()
      dp.remove()
    })
    await page.waitForTimeout(100)
    expect(await page.evaluate(() => document.documentElement.classList.contains('ty-scroll-locked'))).toBe(false)
    expect(errors).toEqual([])
  })

  test('the modal around it closed in the same task: the calendar stays shut', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mobile uses the native date input, no popup calendar')
    await mount(page, MODAL)
    await page.evaluate(() => { (document.getElementById('m') as any).open = true })
    await page.waitForTimeout(100)
    await page.evaluate(() => {
      ;(document.getElementById('dp')!.shadowRoot!.querySelector('.date-picker-stub') as HTMLElement).click()
      ;(document.getElementById('m') as any).hide()
    })
    await page.waitForTimeout(100)
    expect(await state(page)).toEqual({ locked: false, expanded: 'false', calendar: false })
  })
})
