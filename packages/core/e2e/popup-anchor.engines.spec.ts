import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

/**
 * ty-popup opens from its anchor (the parent element) on pointerdown for mouse
 * and touch, and on a click with detail 0 for keyboard activation and
 * anchor.click(). A ty-button anchor re-emits its click as a CustomEvent, the
 * native one in detail.originalEvent (a <label> around it gets there too).
 * Neither path may toggle twice, and a key press on a control inside the popup
 * is not a press on the anchor.
 *
 * Keys from a modal dialog nested in an open popup (a date-picker calendar)
 * belong to that dialog: it closes first, then the popup.
 */

const CONTENT = `<div style="width: 160px; padding: 8px; background: #fff;"><button id="inner" type="button">inner</button></div>`

// The parser won't nest <button> in <button>: the native anchor's content
// control is a checkbox (Space activates it, click detail 0).
const ANCHORS: Record<string, string> = {
  'ty-button': `<ty-button id="a" type="button">Open<ty-popup id="p">${CONTENT}</ty-popup></ty-button>`,
  '<button>': `<button id="a" type="button">Open<ty-popup id="p"><div style="width: 160px; padding: 8px; background: #fff;"><input id="inner" type="checkbox"></div></ty-popup></button>`,
}

async function mountPopup(page: Page, html: string) {
  await mount(page, html)
  await page.evaluate(() => {
    const w = window as any
    w.log = { opens: 0, closes: 0 }
    const p = document.getElementById('p')!
    p.addEventListener('open', () => w.log.opens++)
    p.addEventListener('close', () => w.log.closes++)
  })
}

const popupOpen = (page: Page, id = 'p') =>
  page.evaluate((id) => {
    const el = document.getElementById(id)!
    return Array.from(el.shadowRoot!.querySelectorAll('dialog')).some((d) => d.open)
  }, id)

const log = (page: Page) => page.evaluate(() => (window as any).log)

/** Past the open (two frames) and close (exit transition) sequences. */
const settle = (page: Page) => page.waitForTimeout(400)

/** Focus what a key press lands on: the inner <button> of a ty-button. */
const focusAnchor = (page: Page) =>
  page.evaluate(() => {
    const a = document.getElementById('a')!
    ;((a.shadowRoot?.querySelector('button') ?? a) as HTMLElement).focus()
  })

for (const [name, markup] of Object.entries(ANCHORS)) {
  test.describe(`ty-popup, ${name} anchor`, () => {
    for (const key of ['Enter', 'Space']) {
      test(`${key} on the focused anchor opens it once`, async ({ page }) => {
        await mountPopup(page, markup)
        await focusAnchor(page)
        await page.keyboard.press(key)
        await settle(page)
        expect(await popupOpen(page)).toBe(true)
        expect(await log(page)).toEqual({ opens: 1, closes: 0 })
      })
    }

    test('anchor.click() opens it', async ({ page }) => {
      await mountPopup(page, markup)
      await page.evaluate(() => document.getElementById('a')!.click())
      await settle(page)
      expect(await popupOpen(page)).toBe(true)
    })

    test('a mouse click opens it once, a click outside closes it once', async ({ page }) => {
      await mountPopup(page, `${markup}<div style="height: 300px;"></div>`)
      await page.locator('#a').click()
      await settle(page)
      expect(await popupOpen(page)).toBe(true)
      expect(await log(page)).toEqual({ opens: 1, closes: 0 })

      await page.mouse.click(5, 400)
      await settle(page)
      expect(await popupOpen(page)).toBe(false)
      expect(await log(page)).toEqual({ opens: 1, closes: 1 })
    })

    test('a key press on a control in the popup leaves it open', async ({ page }) => {
      await mountPopup(page, markup)
      await page.locator('#a').click()
      await settle(page)
      await page.locator('#inner').focus()
      // One press: a second one would toggle it back
      await page.keyboard.press('Space')
      await settle(page)
      expect(await popupOpen(page)).toBe(true)
      expect(await log(page)).toEqual({ opens: 1, closes: 0 })
    })
  })
}

// Opened by a click, focus used to stay on the page (showModal() ran while
// the content was hidden for positioning): Escape became the browser's close
// request, which closed even a disable-close popup.
for (const [name, markup] of Object.entries(ANCHORS)) {
  test(`ty-popup, ${name} anchor: Escape closes it, unless disable-close`, async ({ page }) => {
    await mountPopup(page, `${markup.replace('<ty-popup id="p"', '<ty-popup id="p" disable-close')}<div style="height: 300px;"></div>`)
    await page.locator('#a').click()
    await settle(page)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await settle(page)
    expect(await popupOpen(page), 'disable-close').toBe(true)

    await page.evaluate(() => document.getElementById('p')!.removeAttribute('disable-close'))
    await page.keyboard.press('Escape')
    await settle(page)
    expect(await popupOpen(page)).toBe(false)
    expect(await log(page)).toEqual({ opens: 1, closes: 1 })
    expect(await page.locator('#a').getAttribute('aria-expanded')).toBe('false')
  })
}

// After a couple of close requests the browser stops letting `cancel` be
// prevented: with focus outside the popup (a focused Save button that
// disabled itself), the third Escape closed a disable-close popup.
test('ty-popup disable-close: no Escape closes it, focus outside the popup', async ({ page, isMobile }) => {
  await mountPopup(page, `<ty-button id="a" type="button">Open<ty-popup id="p" disable-close><div style="width: 160px; padding: 8px; background: #fff;"><button id="save" type="button" onclick="this.disabled = true">Save</button></div></ty-popup></ty-button>`)
  if (isMobile) await page.tap('#a')
  else await page.click('#a')
  await settle(page)
  if (isMobile) await page.tap('#save')
  else await page.click('#save')
  for (let i = 0; i < 4; i++) await page.keyboard.press('Escape')
  await settle(page)
  expect(await popupOpen(page)).toBe(true)
})

// Opening focuses the popup's own dialog, inside the anchor <button>: its
// default action turned Enter into a submit and Space into a close.
for (const anchor of ['ty-button', 'button']) {
  test(`ty-popup in a form: Enter and Space on the opened popup don't press its ${anchor} anchor`, async ({ page, isMobile }) => {
    await mountPopup(page, `<form id="f"><${anchor} id="a" type="submit">Share<ty-popup id="p"><div style="width: 160px; padding: 8px; background: #fff;"><span>Copy link</span></div></ty-popup></${anchor}></form>`)
    await page.evaluate(() => {
      const w = window as any
      w.n = { submits: 0, clicks: 0 }
      document.getElementById('f')!.addEventListener('submit', (e) => { e.preventDefault(); w.n.submits++ })
      document.getElementById('a')!.addEventListener('click', () => w.n.clicks++)
    })
    if (isMobile) await page.tap('#a')
    else await page.click('#a')
    await settle(page)
    const opened = await page.evaluate(() => (window as any).n.clicks)
    await page.keyboard.press('Enter')
    await page.keyboard.press('Space')
    await settle(page)
    expect(await page.evaluate(() => (window as any).n)).toEqual({ submits: 0, clicks: opened })
    expect(await popupOpen(page)).toBe(true)
  })
}

// ty-input transitions its visibility along with the popup's: its input
// can't take focus in the opening frame.
test('ty-popup: an [autofocus] ty-input in it takes the focus', async ({ page, isMobile }) => {
  await mountPopup(page, `<button id="a" type="button">Open<ty-popup id="p"><div style="width: 200px; padding: 8px; background: #fff;"><ty-input id="ti" autofocus></ty-input></div></ty-popup></button>`)
  if (isMobile) await page.tap('#a')
  else await page.click('#a')
  await settle(page)
  expect(await page.evaluate(() => {
    const ti = document.getElementById('ti')!
    return document.activeElement === ti && ti.shadowRoot!.activeElement?.localName === 'input'
  })).toBe(true)
})

// React's `{show && <TyPopup/>}`: the anchor stays. Its old listeners ran
// showModal() on the detached popup, which threw after locking the page.
test('ty-popup removed on its own: its anchor no longer opens anything or locks the page', async ({ page, isMobile }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await mountPopup(page, `<div style="height: 3000px;">${ANCHORS['ty-button']}</div>`)
  await page.evaluate(() => document.getElementById('p')!.remove())
  if (isMobile) await page.tap('#a')
  else await page.click('#a')
  await settle(page)
  expect(errors).toEqual([])
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden')
  expect(await page.locator('#a').getAttribute('aria-haspopup')).toBeNull()
})

test('ty-popup: a <label> around a ty-button anchor opens it', async ({ page }) => {
  await mountPopup(page, `<label id="l"><span id="text">Share</span> ${ANCHORS['ty-button']}</label>`)
  await page.locator('#text').click()
  await settle(page)
  expect(await popupOpen(page)).toBe(true)
  expect(await log(page)).toEqual({ opens: 1, closes: 0 })
})

// A press on a ty-button's padding or border lands on the host, which presses
// its inner button again: a click with detail 0, as from a key. It ends the
// press that already opened the popup on pointerdown, so it must not toggle;
// held past the opening frames, it used to close the popup again.
for (const [name, style] of [['padded', 'padding: 12px'], ['bordered', 'border: 6px solid #888']]) {
  test(`ty-popup: a slow press on the edge of a ${name} ty-button anchor opens it once`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'a mouse press')
    await mountPopup(page, `<ty-button id="a" type="button" style="${style};">Open<ty-popup id="p">${CONTENT}</ty-popup></ty-button><div style="height: 300px;"></div>`)
    const box = (await page.locator('#a').boundingBox())!
    await page.mouse.move(box.x + 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(150)
    await page.mouse.up()
    await settle(page)
    expect(await popupOpen(page)).toBe(true)
    expect(await log(page)).toEqual({ opens: 1, closes: 0 })

    // Still closes from outside, once
    await page.mouse.click(5, 400)
    await settle(page)
    expect(await popupOpen(page)).toBe(false)
    expect(await log(page)).toEqual({ opens: 1, closes: 1 })
  })
}

test.describe('ty-popup: keys of a nested dialog', () => {
  const ANCHOR = (body: string) => `
    <span id="a" tabindex="0" style="display: inline-block; padding: 8px;">Open
      <ty-popup id="p"><div style="width: 320px; padding: 8px; background: #fff;">${body}</div></ty-popup>
    </span>`

  /** aria-label of the deepest focused element, through shadow roots. */
  const focusedLabel = (page: Page) =>
    page.evaluate(() => {
      let a: Element | null = document.activeElement
      while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement
      return a?.getAttribute('aria-label') ?? ''
    })

  test('ty-date-picker: arrows move the day, Escape closes the calendar, then the popup', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mobile uses the native date input, no popup calendar')
    await mountPopup(page, ANCHOR(`<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`))
    await page.locator('#a').click()
    await expect.poll(() => popupOpen(page)).toBe(true)
    await page.locator('#dp .date-picker-stub').click()
    await expect.poll(() => popupOpen(page, 'dp')).toBe(true)

    // The picker leaves the focus on the page when it opens; move it to the grid
    await page.locator('#dp .calendar-day-cell[tabindex="0"]').focus()
    expect(await focusedLabel(page)).toContain('15')
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => focusedLabel(page)).toContain('16')

    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page, 'dp')).toBe(false)
    await settle(page)
    expect(await popupOpen(page), 'popup stays open').toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page)).toBe(false)

    // Both closed cleanly: they open again
    await page.locator('#a').click()
    await expect.poll(() => popupOpen(page)).toBe(true)
    await page.locator('#dp .date-picker-stub').click()
    await expect.poll(() => popupOpen(page, 'dp')).toBe(true)
  })

  test('ty-select: keys pick, Escape closes the list, then the popup', async ({ page }) => {
    await mountPopup(page, ANCHOR(`<ty-select id="s"><ty-option value="o0">Option 0</ty-option><ty-option value="o1">Option 1</ty-option></ty-select>`))
    await page.locator('#a').click()
    await expect.poll(() => popupOpen(page)).toBe(true)

    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect.poll(() => page.evaluate(() => (document.getElementById('s') as any).value)).toBe('o0')
    expect(await popupOpen(page), 'popup stays open after a pick').toBe(true)

    await page.locator('#s .select-stub').click()
    await expect.poll(() => popupOpen(page, 's')).toBe(true)
    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page, 's')).toBe(false)
    expect(await popupOpen(page), 'popup stays open').toBe(true)

    await page.keyboard.press('Escape')
    await expect.poll(() => popupOpen(page)).toBe(false)
  })
})
