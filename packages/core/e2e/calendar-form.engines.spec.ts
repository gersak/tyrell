import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

// ty-calendar in a <form> and under the keyboard, driven by real input on
// every engine: the invalid calendar takes the focus on submit (its day grid
// is the validation anchor) and nothing is logged, `required`, Tab order and
// clicks on the calendar's chrome, the focus staying in the grid after a
// pick, years below 100, and the locale of a standalone navigation.

/** aria-label of the focused day cell, or what has the focus instead. */
const focusedDay = (page: Page) => page.evaluate(() => {
  let el: Element | null = document.activeElement
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el?.getAttribute('role') === 'gridcell' ? el.getAttribute('aria-label') : el?.tagName.toLowerCase() ?? null
})

/** aria-label (else id) of the focused element, through the shadow roots. */
const focusedLabel = (page: Page) => page.evaluate(() => {
  let el: Element | null = document.activeElement
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el?.getAttribute('aria-label') ?? el?.id ?? null
})

/** First class of the focused element, through the shadow roots, and its outline style. */
const focusedRing = (page: Page) => page.evaluate(() => {
  let el: Element | null = document.activeElement
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return { cls: el?.classList[0] ?? null, outline: el ? getComputedStyle(el).outlineStyle : null }
})

/** Count submits (prevented) and keep the last FormData as name=value pairs. */
async function watchSubmits(page: Page) {
  await page.evaluate(() => {
    const w = window as any
    w.__submits = 0
    w.__data = null
    document.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault()
      w.__submits++
      w.__data = Array.from(new FormData(e.target as HTMLFormElement).entries())
        .map(([k, v]) => `${k}=${v}`).join('&')
    })
  })
}

const submits = (page: Page) => page.evaluate(() => (window as any).__submits as number)
const lastData = (page: Page) => page.evaluate(() => (window as any).__data as string | null)
const day = (page: Page, n: number) =>
  page.locator('#cal ty-calendar-month .calendar-day-cell:not(.other-month)')
    .filter({ hasText: new RegExp(`^${n}$`) })

/** "The invalid form control with name='c' is not focusable." Firefox logs
    it on a blocked submit when the host can't take focus, also when it
    focused the anchor; Chromium when the anchor can't. */
function watchUnfocusable(page: Page) {
  const logs: string[] = []
  page.on('console', (m) => { if (/not focusable/.test(m.text())) logs.push(m.text()) })
  return () => logs
}

test.describe('ty-calendar — invalid calendar takes the focus', () => {
  test('submit with a value below min: blocked, the selected day is focused', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    await mount(page, `<form><ty-calendar id="cal" name="c" min="2026-01-01" value="2025-06-15"></ty-calendar><button id="send">Send</button></form>`)
    await watchSubmits(page)
    await page.click('#send')
    expect(await submits(page)).toBe(0)
    expect(await focusedDay(page)).toBe('Sunday, June 15, 2025')
    expect(unfocusable()).toEqual([])
  })

  test('form.reportValidity(), requestSubmit() and calendar.reportValidity() focus the grid', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    // Mar 15 is after max: the grid's tab stop is its first enabled day
    await mount(page, `<form><ty-calendar id="cal" name="c" max="2026-03-01" value="2026-03-15"></ty-calendar><button id="send">Send</button></form>`)
    await watchSubmits(page)
    await expect(page.locator('#cal ty-calendar-month .calendar-day-cell[tabindex="0"]'))
      .toHaveAttribute('aria-label', 'Monday, February 23, 2026')
    for (const run of [
      () => (document.querySelector('form') as HTMLFormElement).reportValidity(),
      () => (document.querySelector('form') as HTMLFormElement).requestSubmit(),
      () => (document.querySelector('#cal') as any).reportValidity(),
    ]) {
      await page.focus('#send')
      await page.evaluate(run)
      expect(await focusedDay(page), String(run)).toBe('Monday, February 23, 2026')
    }
    expect(await submits(page)).toBe(0)
    expect(unfocusable()).toEqual([])
  })

  test('setCustomValidity on an in-range day: the tab stop day takes the focus', async ({ page }) => {
    await mount(page, `<form><ty-calendar id="cal" name="c" value="2026-03-15"></ty-calendar><button id="send">Send</button></form>`)
    await watchSubmits(page)
    await page.locator('#cal').evaluate((el: any) => el.setCustomValidity('Pick another day'))
    await page.click('#send')
    expect(await submits(page)).toBe(0)
    expect(await focusedDay(page)).toBe('Sunday, March 15, 2026')
  })

  test('first invalid field in form order takes the focus', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    await mount(page, `
      <form>
        <ty-calendar id="cal" name="c" required></ty-calendar>
        <ty-input name="t" required></ty-input>
        <button id="send">Send</button>
      </form>`)
    await page.click('#send')
    expect(await focusedDay(page)).toMatch(/\d{4}$/) // a day of the grid
    // The calendar valid: the input is next
    await day(page, 10).click()
    await page.click('#send')
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('t')
    expect(unfocusable()).toEqual([])
  })

  test('an earlier ty-input with an error line keeps the focus', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    await mount(page, `
      <form>
        <ty-input name="t" required></ty-input>
        <ty-calendar id="cal" name="c" required></ty-calendar>
        <button id="send">Send</button>
      </form>`)
    await page.click('#send')
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('t')
    expect(unfocusable()).toEqual([])
  })

  // The focus stays on the input: Firefox checked the calendar's host with
  // nothing of it focused.
  test('an earlier invalid native input keeps the focus; nothing is logged for the calendar', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    await mount(page, `
      <form>
        <input name="i" required>
        <ty-calendar id="cal" name="c" required></ty-calendar>
        <ty-calendar id="cal2" name="c2" required hide-navigation></ty-calendar>
        <button id="send">Send</button>
      </form>`)
    await watchSubmits(page)
    await page.click('#send')
    expect(await submits(page)).toBe(0)
    expect(await page.evaluate(() => document.activeElement?.getAttribute('name'))).toBe('i')
    expect(unfocusable()).toEqual([])
  })

  test('month view: the month takes the focus, with every month disabled the title', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    for (const [min, focused] of [['2025-03-01', 'March 2025'], ['2026-01-01', 'Back to days']]) {
      await mount(page, `<form><ty-calendar id="cal" name="c" min="${min}" value="2025-01-15"></ty-calendar><button id="send">Send</button></form>`)
      await watchSubmits(page)
      await page.click('#cal ty-calendar-navigation .nav-title')
      await page.click('#send')
      expect(await submits(page), min).toBe(0)
      expect(await focusedLabel(page), min).toBe(focused)
      await page.focus('#send')
      await page.evaluate(() => document.querySelector('form')!.requestSubmit())
      expect(await focusedLabel(page), min).toBe(focused)
    }
    expect(unfocusable()).toEqual([])
  })

  test('in a disabled fieldset it is not validated: the form submits, nothing is logged', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    await mount(page, `<form><fieldset disabled><ty-calendar id="cal" name="c" required></ty-calendar></fieldset><button id="send">Send</button></form>`)
    await watchSubmits(page)
    await page.click('#send')
    expect(await submits(page)).toBe(1)
    expect(await page.locator('#cal').evaluate((el: any) => el.willValidate)).toBe(false)
    expect(unfocusable()).toEqual([])
  })
})

// The anchor is a day cell, and a move through the months rebuilds the
// cells. WebKit keeps a pointer to the anchor its bubble was shown on without
// keeping it alive: once the cell was garbage-collected, the next submit
// crashed the page.
test.describe('ty-calendar — the bubble outlives its day cell', () => {
  const gc = (page: Page) => page.evaluate(() => { const a: object[] = []; for (let i = 0; i < 300000; i++) a.push({ i }); return a.length })
  for (const [name, move] of [
    ['PageDown', (page: Page) => page.keyboard.press('PageDown')],
    ['the next-month arrow', (page: Page) => page.click('#cal ty-calendar-navigation .nav-month-next')],
  ] as const) {
    test(`submit, ${name}, garbage collection, submit: the page lives`, async ({ page }) => {
      let crashed = false
      page.on('crash', () => { crashed = true })
      await mount(page, `<form><ty-calendar id="cal" name="c" required></ty-calendar><button id="send">Send</button></form>`)
      await watchSubmits(page)
      for (let round = 0; round < 4; round++) {
        await page.click('#send')
        await page.waitForTimeout(100)
        await move(page)
        await gc(page).catch(() => {})
        await page.waitForTimeout(100)
      }
      await page.click('#send').catch(() => {})
      await page.waitForTimeout(300)
      expect(crashed).toBe(false)
      expect(await submits(page)).toBe(0)
    })
  }
})

test.describe('ty-calendar — required', () => {
  test('empty blocks submit with the browser message; a pick submits; reset empties it again', async ({ page }) => {
    const unfocusable = watchUnfocusable(page)
    await mount(page, `<form><ty-calendar id="cal" name="c" value="" required></ty-calendar><button id="send">Send</button></form>`)
    await watchSubmits(page)
    const cal = page.locator('#cal')
    const native = await page.evaluate(() => {
      const i = document.createElement('input')
      i.type = 'date'
      i.required = true
      return i.validationMessage
    })
    expect(await cal.evaluate((el: any) => [el.required, el.validity.valueMissing, el.validationMessage]))
      .toEqual([true, true, native])
    await page.click('#send')
    expect(await submits(page)).toBe(0)
    expect(await focusedDay(page)).toMatch(/\d{4}$/)
    expect(unfocusable()).toEqual([])

    await page.keyboard.press('Enter') // the focused day
    await page.click('#send')
    expect(await submits(page)).toBe(1)
    expect(await lastData(page)).toMatch(/^c=\d{4}-\d{2}-\d{2}$/)

    await page.evaluate(() => (document.querySelector('form') as HTMLFormElement).reset())
    expect(await cal.evaluate((el: any) => [el.value, el.validity.valueMissing])).toEqual(['', true])

    await cal.evaluate((el: any) => { el.required = false })
    expect(await cal.evaluate((el: any) => [el.hasAttribute('required'), el.validity.valid])).toEqual([false, true])
  })
})

// The host delegates focus (Firefox checks it on a blocked submit); its
// delegate is the container, which is no tab stop.
test.describe('ty-calendar — Tab, focus() and clicks on its chrome', () => {
  const nav = ['Choose month and year', 'Previous month', 'Next month']

  test('Tab goes through the navigation to the tab stop day and out, Shift+Tab back; focus() lands on the day', async ({ page }) => {
    await mount(page, `<input id="before"><ty-calendar id="cal" value="2026-03-15"></ty-calendar><input id="after">`)
    const stops = async (key: string, end: string) => {
      const seen: (string | null)[] = []
      while (seen.length < 8 && seen[seen.length - 1] !== end) {
        await page.keyboard.press(key)
        seen.push(await focusedLabel(page))
      }
      return seen
    }
    await page.focus('#before')
    // WebKit leaves buttons out of the tab order (macOS default)
    expect((await stops('Tab', 'after')).filter((l) => !nav.includes(l!))).toEqual(['Sunday, March 15, 2026', 'after'])
    expect((await stops('Shift+Tab', 'before')).filter((l) => !nav.includes(l!))).toEqual(['Sunday, March 15, 2026', 'before'])
    await page.locator('#cal').evaluate((el: any) => el.focus())
    expect(await focusedLabel(page)).toBe('Sunday, March 15, 2026')
  })

  test('in the month view a click between two months picks none', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-03-15"></ty-calendar>`)
    await page.click('#cal ty-calendar-navigation .nav-title')
    const [jan, feb] = await page.locator('#cal .month-cell').evaluateAll((cells) =>
      cells.slice(0, 2).map((c) => c.getBoundingClientRect().toJSON()))
    await page.mouse.click((jan.right + feb.left) / 2, jan.top + jan.height / 2)
    expect(await focusedLabel(page)).not.toBe('January 2026')
    await page.keyboard.press('Enter')
    await expect(page.locator('#cal .month-grid')).toHaveCount(1)
  })

  // Chromium: with the focus out of the dialog, a second Escape is a close
  // request the modal can't cancel.
  test('a click on the weekday names keeps the focus in the calendar: a prevent-escape ty-modal stays open on Escape', async ({ page }) => {
    await mount(page, `<ty-modal id="m" prevent-escape><ty-calendar id="cal" value="2026-03-15"></ty-calendar></ty-modal>`)
    await page.locator('#m').evaluate((el: any) => el.show())
    await page.locator('#cal ty-calendar-month .calendar-header-cell').first().click()
    expect(await page.locator('#cal').evaluate((el) => el.matches(':focus-within'))).toBe(true)
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    expect(await page.locator('#m').evaluate((el: any) => el.open)).toBe(true)
  })

  // After that click the container has the focus: a key press drew the
  // browser's ring around the whole calendar and arrows did nothing.
  test('after a click on the weekday names a key draws no ring; an arrow goes into the grid', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-03-15"></ty-calendar>`)
    await page.locator('#cal ty-calendar-month .calendar-header-cell').first().click()
    expect(await focusedRing(page)).toEqual({ cls: 'calendar-container', outline: 'none' })
    await page.keyboard.press('Shift')
    await page.keyboard.press('Enter')
    expect(await page.locator('#cal').evaluate((el: any) => el.value)).toBe('2026-03-15')
    expect(await focusedRing(page)).toEqual({ cls: 'calendar-container', outline: 'none' })
    await page.keyboard.press('ArrowRight')
    expect(await focusedDay(page)).toBe('Sunday, March 15, 2026')
  })
})

// Any other focus that reaches the container (a dialog opening, a label,
// autofocus) goes on to the tab stop day. It stayed on the container, with
// the browser's ring around the whole calendar and dead arrow keys.
test.describe('ty-calendar — focus from a dialog, a label or autofocus lands on the day', () => {
  const dialog = `<button id="opener" onclick="document.getElementById('dlg').showModal()">open</button>
    <dialog id="dlg"><ty-calendar id="cal" value="2026-03-15"></ty-calendar><button id="ok">OK</button></dialog>`

  test('a modal <dialog> opened from the keyboard', async ({ page }) => {
    await mount(page, dialog)
    await page.focus('#opener')
    await page.keyboard.press('Enter')
    await expect.poll(() => focusedDay(page)).toBe('Sunday, March 15, 2026')
    await page.keyboard.press('ArrowRight')
    expect(await focusedDay(page)).toBe('Monday, March 16, 2026')
  })

  test('a modal <dialog> opened with a click', async ({ page }) => {
    await mount(page, dialog)
    await page.click('#opener')
    await expect.poll(() => focusedDay(page)).toBe('Sunday, March 15, 2026')
  })

  // Chromium focused the container; Firefox and WebKit the modal's dialog
  test('a ty-modal without a close button does not focus the container', async ({ page }) => {
    await mount(page, `<button id="opener" onclick="document.getElementById('m').show()">open</button>
      <ty-modal id="m" prevent-outside-click><ty-calendar id="cal" value="2026-03-15"></ty-calendar><button id="ok">OK</button></ty-modal>`)
    await page.focus('#opener')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    expect((await focusedRing(page)).cls).not.toBe('calendar-container')
  })

  test('a click on a <label for> and on the text of a wrapping <label>', async ({ page }) => {
    await mount(page, `<input id="before"><label id="lab" for="cal">Date</label><ty-calendar id="cal" value="2026-03-15"></ty-calendar>
      <label><span id="txt">Other date</span><ty-calendar id="cal2" value="2026-04-20"></ty-calendar></label>`)
    await page.focus('#before')
    await page.click('#lab')
    expect(await focusedDay(page)).toBe('Sunday, March 15, 2026')
    await page.focus('#before')
    await page.click('#txt')
    expect(await focusedDay(page)).toBe('Monday, April 20, 2026')
  })

  test('autofocus', async ({ page }) => {
    await mount(page, `<input id="before"><ty-calendar id="cal" autofocus value="2026-03-15"></ty-calendar>`)
    await expect.poll(() => focusedDay(page)).toBe('Sunday, March 15, 2026')
  })

  // The container is focused first, then ty-date-picker blurs it: Tab still
  // starts before the navigation (with the day focused it started after it)
  test('ty-date-picker opened from the keyboard: Tab goes to the navigation first', async ({ page, browserName }) => {
    // WebKit leaves buttons out of Tab (macOS full keyboard access); Alt+Tab
    // reaches them, with a stop on the <dialog> itself first
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab'
    await mount(page, `<input id="before"><ty-date-picker id="d" value="2026-03-15"></ty-date-picker>`)
    test.skip(await page.locator('#d .native-date-input').count() > 0, 'touch devices get the native input')
    await page.focus('#before')
    await page.keyboard.press(tab)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(300)
    await page.keyboard.press(tab)
    if (browserName === 'webkit') await page.keyboard.press(tab)
    expect(await focusedLabel(page)).toBe('Choose month and year')
  })
})

test.describe('ty-calendar — the focus stays in the grid after a pick', () => {
  test('click, then arrows and Enter / Space', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-03-15"></ty-calendar>`)
    await day(page, 18).click()
    expect(await focusedDay(page)).toBe('Wednesday, March 18, 2026')
    await page.keyboard.press('ArrowRight')
    expect(await focusedDay(page)).toBe('Thursday, March 19, 2026')
    await page.keyboard.press('Enter')
    expect(await page.locator('#cal').evaluate((el: any) => el.value)).toBe('2026-03-19')
    expect(await focusedDay(page)).toBe('Thursday, March 19, 2026')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press(' ')
    expect(await page.locator('#cal').evaluate((el: any) => el.value)).toBe('2026-03-26')
    expect(await focusedDay(page)).toBe('Thursday, March 26, 2026')
    await page.keyboard.press('ArrowLeft')
    expect(await focusedDay(page)).toBe('Wednesday, March 25, 2026')
  })

  test('a day of the next month: the grid moves, the focus goes with the pick', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-03-15"></ty-calendar>`)
    // March 2026's grid ends on Sunday April 5
    await page.locator('#cal ty-calendar-month .calendar-day-cell.other-month', { hasText: /^2$/ }).last().click()
    expect(await page.locator('#cal').evaluate((el: any) => el.value)).toBe('2026-04-02')
    expect(await focusedDay(page)).toBe('Thursday, April 2, 2026')
    // the tab stop is the picked day
    const stops = await page.locator('#cal ty-calendar-month .calendar-day-cell[tabindex="0"]').allTextContents()
    expect(stops).toEqual(['2'])
  })
})

test.describe('ty-calendar — years below 100', () => {
  test('standalone value 0099-05-05 shows May 99 with the 5th selected', async ({ page }) => {
    await mount(page, `<form><ty-calendar id="cal" name="c" value="0099-05-05"></ty-calendar></form>`)
    const cal = page.locator('#cal')
    expect(await cal.evaluate((el: any) => [el.value, el.getAttribute('year')])).toEqual(['0099-05-05', '0099'])
    await expect(page.locator('#cal ty-calendar-month .calendar-day-cell.selected')).toHaveAttribute('aria-label', /May 5, 99$/)
    await day(page, 10).click()
    expect(await cal.evaluate((el: any) => el.value)).toBe('0099-05-10')
    expect(await page.evaluate(() => new FormData(document.querySelector('form')!).get('c'))).toBe('0099-05-10')
  })

  test('date picker 0099-05-05: the popup opens on May 99 and a pick keeps the year', async ({ page }) => {
    await mount(page, `<ty-date-picker id="d" native value="0099-05-05"></ty-date-picker>`)
    const native = page.locator('#d .native-date-input')
    test.skip(await native.count() > 0, 'touch devices get the native input')
    await page.locator('#d .date-picker-stub').click()
    const selected = page.locator('#d ty-calendar-month .calendar-day-cell.selected')
    await expect(selected).toHaveAttribute('aria-label', /May 5, 99$/)
    await page.locator('#d ty-calendar-month .calendar-day-cell:not(.other-month)').filter({ hasText: /^10$/ }).click()
    expect(await page.locator('#d').evaluate((el: any) => el.value)).toBe('0099-05-10')
  })
})

test.describe('ty-calendar-navigation — locale', () => {
  test('standalone under lang="de" is German; an explicit locale wins', async ({ page }) => {
    await mount(page, `
      <section lang="de">
        <ty-calendar-navigation id="de" display-month="3" display-year="2026"></ty-calendar-navigation>
        <ty-calendar-navigation id="fr" locale="fr-FR" display-month="3" display-year="2026"></ty-calendar-navigation>
      </section>`)
    await expect(page.locator('#de .nav-title-month')).toHaveText('März')
    await expect(page.locator('#fr .nav-title-month')).toHaveText('mars')
  })
})
