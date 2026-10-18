import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * A popup open inside an open ty-modal closes first, like nested native
 * top-layer dialogs: the first real Escape closes the select list (focus back
 * on its trigger), the date-picker calendar or the ty-popup, and the modal
 * stays open; the second Escape closes the modal. Whatever the close order,
 * the page scroll lock is released afterwards — html.ty-scroll-locked left
 * behind keeps the page from scrolling and an orphaned modal list keeps it
 * inert (clicks swallowed).
 */

const MODAL = (attrs: string, body: string) => `
  <ty-modal id="m" ${attrs}>
    <div style="width: 360px; padding: 24px; background: #fff; color: #111;">
      ${body}
    </div>
  </ty-modal>
  <button id="after" type="button">after</button>
  <output id="clicks">0</output>
`

const OPTIONS = (n: number) =>
  Array.from({ length: n }, (_, i) => `<ty-option value="o${i}">Option ${i}</ty-option>`).join('')

async function openModal(page: Page) {
  await page.evaluate(() => {
    document.getElementById('after')!.addEventListener('click', () => {
      const out = document.getElementById('clicks')!
      out.textContent = String(Number(out.textContent) + 1)
    })
    document.getElementById('m')!.setAttribute('open', 'true')
  })
  await expect.poll(() => modalOpen(page)).toBe(true)
}

const modalOpen = (page: Page) =>
  page.evaluate(() => {
    const m = document.getElementById('m')
    return !!m && m.hasAttribute('open') && !!m.shadowRoot!.querySelector('dialog')!.open
  })

/** Any dialog in `id`'s shadow root is open (select list, mobile sheet, calendar, popup). */
const popupOpen = (page: Page, id: string) =>
  page.evaluate((id) => {
    const el = document.getElementById(id)!
    return Array.from(el.shadowRoot!.querySelectorAll('dialog')).some((d) => d.open)
  }, id)

const locked = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('ty-scroll-locked'))

/** Class (or tag) of the deepest focused element, through shadow roots. */
const deepFocus = (page: Page) =>
  page.evaluate(() => {
    let a: Element | null = document.activeElement
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
    return a ? (a.className || a.tagName.toLowerCase()) : ''
  })

/** The page takes clicks again: nothing modal left open, nothing inert. */
async function pageIsLive(page: Page) {
  expect(await locked(page)).toBe(false)
  await page.locator('#after').click({ timeout: 2000 })
  await expect(page.locator('#clicks')).toHaveText('1')
}

test.describe('ty-select inside ty-modal: Escape', () => {
  for (const attrs of ['', 'prevent-outside-click']) {
    for (const [name, select] of [
      ['single', `<ty-select id="s" label="Robot">${OPTIONS(3)}</ty-select>`],
      ['multiple', `<ty-select id="s" label="Robots" multiple>${OPTIONS(3)}</ty-select>`],
      ['with search row', `<ty-select id="s" label="Robot">${OPTIONS(12)}</ty-select>`],
    ]) {
      test(`${name}${attrs ? `, ${attrs}` : ''}: list first, then the modal`, async ({ page }) => {
        await mount(page, MODAL(attrs, select))
        await openModal(page)

        await page.locator('#s .select-stub').click()
        await expect.poll(() => popupOpen(page, 's')).toBe(true)
        expect(await locked(page)).toBe(true)

        await page.keyboard.press('Escape')
        await expect.poll(() => popupOpen(page, 's')).toBe(false)
        expect(await modalOpen(page), 'modal stays open').toBe(true)
        await expect.poll(() => deepFocus(page), 'focus back on the trigger').toContain('select-stub')
        expect(await locked(page), 'modal still holds its lock').toBe(true)

        await page.keyboard.press('Escape')
        await expect.poll(() => modalOpen(page)).toBe(false)
        await pageIsLive(page)
      })
    }
  }

  test('arrow keys still reach the list inside a modal', async ({ page }) => {
    await mount(page, MODAL('', `<ty-select id="s">${OPTIONS(3)}</ty-select>`))
    await openModal(page)
    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect.poll(() => page.evaluate(() => (document.getElementById('s') as any).value)).toBe('o1')
    expect(await modalOpen(page)).toBe(true)
  })

  test('modal closed in code while the list is open: list closes too, lock released', async ({ page }) => {
    await mount(page, MODAL('', `<ty-select id="s">${OPTIONS(3)}</ty-select>`))
    await openModal(page)
    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)

    await page.evaluate(() => (document.getElementById('m') as any).hide())
    await expect.poll(() => modalOpen(page)).toBe(false)
    await expect.poll(() => popupOpen(page, 's')).toBe(false)
    expect(await page.locator('#s .select-stub').getAttribute('aria-expanded')).toBe('false')
    await pageIsLive(page)
  })

  test('modal removed while the list is open: lock released', async ({ page }) => {
    await mount(page, MODAL('', `<ty-select id="s">${OPTIONS(3)}</ty-select>`))
    await openModal(page)
    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)

    await page.evaluate(() => document.getElementById('m')!.remove())
    await pageIsLive(page)
  })

  test('nested modal: Escape closes the inner modal only', async ({ page }) => {
    await mount(page, MODAL('', `
      <ty-modal id="inner"><div style="padding: 24px; background: #fff;">inner</div></ty-modal>`))
    await openModal(page)
    await page.evaluate(() => document.getElementById('inner')!.setAttribute('open', 'true'))
    await page.keyboard.press('Escape')
    await expect.poll(() => page.evaluate(() => document.getElementById('inner')!.hasAttribute('open'))).toBe(false)
    expect(await modalOpen(page)).toBe(true)
    await page.keyboard.press('Escape')
    await expect.poll(() => modalOpen(page)).toBe(false)
    await pageIsLive(page)
  })
})

test.describe('other popups inside ty-modal: Escape', () => {
  test('ty-date-picker calendar first, then the modal', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mobile uses the native date input, no popup calendar')
    await mount(page, MODAL('', `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`))
    await openModal(page)
    await page.locator('#dp .date-picker-stub').click()
    await expect.poll(() => popupOpen(page, 'dp')).toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page, 'dp')).toBe(false)
    expect(await modalOpen(page), 'modal stays open').toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => modalOpen(page)).toBe(false)
    await pageIsLive(page)
  })

  test('ty-popup first, then the modal', async ({ page }) => {
    await mount(page, MODAL('', `
      <span id="anchor" tabindex="0" style="display: inline-block; padding: 8px;">Open
        <ty-popup id="p"><div style="width: 120px; padding: 8px; background: #fff;">popup</div></ty-popup>
      </span>`))
    await openModal(page)
    await page.locator('#anchor').click()
    await expect.poll(() => popupOpen(page, 'p')).toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page, 'p')).toBe(false)
    expect(await modalOpen(page), 'modal stays open').toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => modalOpen(page)).toBe(false)
    await pageIsLive(page)
  })

  test('ty-select in a ty-popup: keys pick, then Escape closes the list, the popup, the modal in turn', async ({ page }) => {
    await mount(page, MODAL('', `
      <span id="anchor" tabindex="0" style="display: inline-block; padding: 8px;">Open
        <ty-popup id="p"><div style="width: 220px; padding: 8px; background: #fff;"><ty-select id="s">${OPTIONS(3)}</ty-select></div></ty-popup>
      </span>`))
    await openModal(page)
    await page.locator('#anchor').click()
    await expect.poll(() => popupOpen(page, 'p')).toBe(true)

    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect.poll(() => page.evaluate(() => (document.getElementById('s') as any).value)).toBe('o0')
    expect(await popupOpen(page, 'p'), 'popup stays open after a pick').toBe(true)

    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)
    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page, 's')).toBe(false)
    expect(await popupOpen(page, 'p'), 'popup stays open').toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page, 'p')).toBe(false)
    expect(await modalOpen(page), 'modal stays open').toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => modalOpen(page)).toBe(false)
    await pageIsLive(page)
  })
})
