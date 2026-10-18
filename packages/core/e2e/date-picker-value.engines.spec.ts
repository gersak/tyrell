import { test, expect, Page } from '@playwright/test'
import { mount } from './helpers'

// ty-date-picker values per timezone, on every engine. Default mode submits a
// UTC instant (date-only: the moment the day starts in the browser's zone);
// `native` submits wall-clock like <input type=date / datetime-local>.
// Oct 25 2026 is the day Europe/Zagreb leaves summer time (UTC+2 → UTC+1);
// Asia/Kolkata has a half-hour offset. Mobile projects get the native input
// instead of the popup calendar.

type Zone = {
  oct16: string
  oct25: string
  oct26: string
  /** Oct 25, 14:30 local */
  oct25at1430: string
  /** 2026-10-25T23:30:00.000Z read locally */
  z2330: { day: number; wall: string }
  /** 2026-10-25T01:30:00+02:00 (= Oct 24 23:30Z) read locally */
  plus2: { day: number; wall: string }
}

const ZONES: Record<string, Zone> = {
  'Europe/Zagreb': {
    oct16: '2026-10-15T22:00:00.000Z',
    oct25: '2026-10-24T22:00:00.000Z',
    oct26: '2026-10-25T23:00:00.000Z',
    oct25at1430: '2026-10-25T13:30:00.000Z',
    z2330: { day: 26, wall: '2026-10-26T00:30' },
    plus2: { day: 25, wall: '2026-10-25T01:30' },
  },
  'America/New_York': {
    oct16: '2026-10-16T04:00:00.000Z',
    oct25: '2026-10-25T04:00:00.000Z',
    oct26: '2026-10-26T04:00:00.000Z',
    oct25at1430: '2026-10-25T18:30:00.000Z',
    z2330: { day: 25, wall: '2026-10-25T19:30' },
    plus2: { day: 24, wall: '2026-10-24T19:30' },
  },
  'Asia/Tokyo': {
    oct16: '2026-10-15T15:00:00.000Z',
    oct25: '2026-10-24T15:00:00.000Z',
    oct26: '2026-10-25T15:00:00.000Z',
    oct25at1430: '2026-10-25T05:30:00.000Z',
    z2330: { day: 26, wall: '2026-10-26T08:30' },
    plus2: { day: 25, wall: '2026-10-25T08:30' },
  },
  UTC: {
    oct16: '2026-10-16T00:00:00.000Z',
    oct25: '2026-10-25T00:00:00.000Z',
    oct26: '2026-10-26T00:00:00.000Z',
    oct25at1430: '2026-10-25T14:30:00.000Z',
    z2330: { day: 25, wall: '2026-10-25T23:30' },
    plus2: { day: 24, wall: '2026-10-24T23:30' },
  },
  // Half-hour offset (UTC+5:30), no summer time
  'Asia/Kolkata': {
    oct16: '2026-10-15T18:30:00.000Z',
    oct25: '2026-10-24T18:30:00.000Z',
    oct26: '2026-10-25T18:30:00.000Z',
    oct25at1430: '2026-10-25T09:00:00.000Z',
    z2330: { day: 26, wall: '2026-10-26T05:00' },
    plus2: { day: 25, wall: '2026-10-25T05:00' },
  },
}

/** Pick an October 2026 day (and time) the way a user does: popup clicks, or the native input on touch. */
async function pick(page: Page, id: string, day: number, time?: string) {
  const dd = String(day).padStart(2, '0')
  const native = page.locator(`#${id} .native-date-input`)
  if (await native.count()) {
    await native.fill(time ? `2026-10-${dd}T${time}` : `2026-10-${dd}`)
    return
  }
  await page.locator(`#${id} .date-picker-stub`).click()
  await page
    .locator(`#${id} ty-calendar-month .calendar-day:not(.other-month)`)
    .filter({ hasText: new RegExp(`^\\s*${day}\\s*$`) })
    .click()
  if (time) {
    await expect(page.locator(`#${id} .time-hour`)).toBeFocused()
    await page.keyboard.type(time.replace(':', ''))
    await page.keyboard.press('Escape')
  }
  await expect(page.locator(`#${id} .calendar-dialog`)).not.toHaveAttribute('open', '')
}

const formData = (page: Page) =>
  page.evaluate(() => Object.fromEntries(new FormData(document.querySelector('form')!)) as Record<string, string>)

const valueOf = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((el: any) => el.value as string | null)

for (const [timezoneId, zone] of Object.entries(ZONES)) {
  test.describe(`ty-date-picker values — ${timezoneId}`, () => {
    test.use({ timezoneId })

    test('picked day: default submits the instant it starts here, native submits YYYY-MM-DD', async ({ page }) => {
      await mount(page, `
        <form>
          <ty-date-picker id="d" name="d" value="2026-10-01"></ty-date-picker>
          <ty-date-picker id="n" name="n" value="2026-10-01" native></ty-date-picker>
        </form>`)
      await pick(page, 'd', 16)
      await pick(page, 'n', 16)
      expect(await formData(page)).toEqual({ d: zone.oct16, n: '2026-10-16' })
      expect(await valueOf(page, 'd')).toBe(zone.oct16)
      expect(await valueOf(page, 'n')).toBe('2026-10-16')
    })

    test('DST change: Oct 25 and Oct 26 2026', async ({ page }) => {
      await mount(page, `
        <form>
          <ty-date-picker id="d25" name="d25" value="2026-10-01"></ty-date-picker>
          <ty-date-picker id="d26" name="d26" value="2026-10-01"></ty-date-picker>
          <ty-date-picker id="n25" name="n25" value="2026-10-01" native></ty-date-picker>
          <ty-date-picker id="n26" name="n26" value="2026-10-01" native></ty-date-picker>
        </form>`)
      await pick(page, 'd25', 25)
      await pick(page, 'd26', 26)
      await pick(page, 'n25', 25)
      await pick(page, 'n26', 26)
      expect(await formData(page)).toEqual({
        d25: zone.oct25,
        d26: zone.oct26,
        n25: '2026-10-25',
        n26: '2026-10-26',
      })
    })

    test('with-time pick on the DST day: instant by default, wall-clock with native', async ({ page }) => {
      await mount(page, `
        <form>
          <ty-date-picker id="d" name="d" value="2026-10-01" with-time></ty-date-picker>
          <ty-date-picker id="n" name="n" value="2026-10-01" with-time native></ty-date-picker>
        </form>`)
      await pick(page, 'd', 25, '14:30')
      await pick(page, 'n', 25, '14:30')
      expect(await formData(page)).toEqual({ d: zone.oct25at1430, n: '2026-10-25T14:30' })
    })

    test('value in each format → displayed day and wall-clock', async ({ page }) => {
      await mount(page, `
        <ty-date-picker id="dp" locale="en-US"></ty-date-picker>
        <ty-date-picker id="wc" native with-time></ty-date-picker>`)
      const cases: Array<[string | number, number, string]> = [
        ['2026-10-25', 25, '2026-10-25T00:00'],
        ['2026-10-25T14:30', 25, '2026-10-25T14:30'],
        ['2026-10-25T23:30:00.000Z', zone.z2330.day, zone.z2330.wall],
        ['2026-10-25T01:30:00+02:00', zone.plus2.day, zone.plus2.wall],
        [Date.UTC(2026, 9, 25, 23, 30), zone.z2330.day, zone.z2330.wall],
      ]
      for (const [value, day, wall] of cases) {
        await page.evaluate((v) => {
          for (const id of ['dp', 'wc']) {
            const el = document.getElementById(id) as any
            if (typeof v === 'number') el.value = v
            else el.setAttribute('value', v)
          }
        }, value)
        await expect(page.locator('#dp .stub-text'), String(value)).toHaveText(`October ${day}, 2026`)
        expect(await valueOf(page, 'wc'), String(value)).toBe(wall)
      }
    })

    test('values round-trip between the modes, and toggling native keeps the day', async ({ page }) => {
      await mount(page, `
        <form>
          <ty-date-picker id="d" name="d" value="2026-10-01"></ty-date-picker>
          <ty-date-picker id="n" name="n" native></ty-date-picker>
          <ty-date-picker id="back" name="back"></ty-date-picker>
        </form>`)
      await pick(page, 'd', 25)
      const instant = await valueOf(page, 'd')
      expect(instant).toBe(zone.oct25)

      // The default instant read by a native picker is the picked day
      await page.locator('#n').evaluate((el: any, v) => el.setAttribute('value', v), instant)
      expect(await valueOf(page, 'n')).toBe('2026-10-25')
      // ...and the native day read by a default picker is that instant again
      await page.locator('#back').evaluate((el: any) => el.setAttribute('value', '2026-10-25'))
      expect(await valueOf(page, 'back')).toBe(zone.oct25)

      await page.locator('#d').evaluate((el: any) => el.setAttribute('native', ''))
      expect((await formData(page)).d).toBe('2026-10-25')
      await page.locator('#d').evaluate((el: any) => el.removeAttribute('native'))
      expect((await formData(page)).d).toBe(zone.oct25)
    })

    // new Date(99, …) is 1999: a year below 100 keeps its year in both modes
    test('years below 100 round-trip in both modes', async ({ page }) => {
      await mount(page, `<form><ty-date-picker id="d" name="d" value="0099-05-05"></ty-date-picker></form>`)
      const start = await page.evaluate(() => {
        const d = new Date(0)
        d.setFullYear(99, 4, 5)
        d.setHours(0, 0, 0, 0)
        return d.toISOString()
      })
      const d = page.locator('#d')
      expect(await valueOf(page, 'd')).toBe(start)
      await d.evaluate((el: any) => el.setAttribute('native', ''))
      expect(await valueOf(page, 'd')).toBe('0099-05-05')
      await d.evaluate((el: any) => el.removeAttribute('native'))
      expect((await formData(page)).d).toBe(start)
      // ...and read back from that instant
      await d.evaluate((el: any, v) => { el.setAttribute('native', ''); el.setAttribute('value', v) }, start)
      expect(await valueOf(page, 'd')).toBe('0099-05-05')
    })

    test('runtime with-time / native toggles keep the picked day and time', async ({ page }) => {
      const logs: string[] = []
      page.on('console', (m) => logs.push(m.text()))
      await mount(page, `
        <form>
          <ty-date-picker id="t" name="t" value="2026-10-01" with-time></ty-date-picker>
          <ty-date-picker id="late" name="late"></ty-date-picker>
        </form>`)
      await pick(page, 't', 25, '14:30')
      const t = page.locator('#t')
      const shape = async (attr: string, on: boolean) => {
        await t.evaluate((el: any, [a, o]) => (o ? el.setAttribute(a, '') : el.removeAttribute(a)), [attr, on] as const)
        return (await formData(page)).t
      }
      expect((await formData(page)).t).toBe(zone.oct25at1430)
      expect(await shape('with-time', false)).toBe(zone.oct25)
      expect(await shape('native', true)).toBe('2026-10-25')
      expect(await shape('with-time', true)).toBe('2026-10-25T14:30')
      expect(await shape('native', false)).toBe(zone.oct25at1430)
      await expect(page.locator('#t .stub-text')).toContainText('2:30')

      // A time given while date-only shows once with-time follows it
      await page.locator('#late').evaluate((el: any) => {
        el.setAttribute('value', '2026-10-25T14:30')
        el.setAttribute('with-time', '')
      })
      expect((await formData(page)).late).toBe(zone.oct25at1430)

      // Touch devices: the native input follows (date ↔ datetime-local)
      const native = page.locator('#t .native-date-input')
      if (await native.count()) {
        expect(await native.evaluate((i: HTMLInputElement) => [i.type, i.value])).toEqual(['datetime-local', '2026-10-25T14:30'])
        await shape('with-time', false)
        expect(await native.evaluate((i: HTMLInputElement) => [i.type, i.value])).toEqual(['date', '2026-10-25'])
      }
      expect(logs.filter((l) => /does not conform|not focusable/.test(l))).toEqual([])
    })
  })
}

// Days and times the clocks skip or repeat. A zone-less value (native) is a
// wall-clock and stays as written, like <input type=datetime-local>; an
// instant (default) keeps its exact moment, also in the repeated hour.
const CLOCK_CHANGES: Array<{ timezoneId: string; gap: string; repeated: string[]; dayStart?: [string, string] }> = [
  // Mar 29: 02:00 → 03:00. Oct 25: 03:00 → 02:00 (00:30Z and 01:30Z are both 02:30)
  { timezoneId: 'Europe/Zagreb', gap: '2026-03-29T02:30', repeated: ['2026-10-25T00:30:00.000Z', '2026-10-25T01:30:00.000Z'] },
  // Mar 8: 02:00 → 03:00. Nov 1: 02:00 → 01:00 (05:30Z and 06:30Z are both 01:30)
  { timezoneId: 'America/New_York', gap: '2026-03-08T02:30', repeated: ['2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z'] },
  // Sep 6: the day starts at 01:00 (midnight is skipped)
  { timezoneId: 'America/Santiago', gap: '2026-09-06T00:30', repeated: [], dayStart: ['2026-09-06', '2026-09-06T04:00:00.000Z'] },
]

for (const { timezoneId, gap, repeated, dayStart } of CLOCK_CHANGES) {
  test.describe(`ty-date-picker clock changes — ${timezoneId}`, () => {
    test.use({ timezoneId })

    test('native keeps a skipped time as written; default keeps an instant in the repeated hour', async ({ page }) => {
      await mount(page, `
        <form>
          <ty-date-picker id="n" name="n" native with-time locale="en-US" value="${gap}"></ty-date-picker>
          <ty-date-picker id="d" name="d" with-time></ty-date-picker>
          <ty-date-picker id="day" name="day"></ty-date-picker>
        </form>`)
      expect(await valueOf(page, 'n')).toBe(gap)
      expect((await formData(page)).n).toBe(gap)
      const hm = `${Number(gap.slice(11, 13)) % 12 || 12}:${gap.slice(14, 16)}`
      await expect(page.locator('#n .stub-text')).toContainText(hm)

      for (const instant of repeated) {
        await page.locator('#d').evaluate((el: any, v) => el.setAttribute('value', v), instant)
        expect(await valueOf(page, 'd'), instant).toBe(instant)
        expect((await formData(page)).d, instant).toBe(instant)
      }
      if (dayStart) {
        await page.locator('#day').evaluate((el: any, v) => el.setAttribute('value', v), dayStart[0])
        expect(await valueOf(page, 'day')).toBe(dayStart[1])
      }
    })
  })
}

// A loaded instant (the default output, back from a server) keeps its exact
// moment only until the user edits it.
test.describe('ty-date-picker touch devices — Europe/Zagreb', () => {
  test.use({ timezoneId: 'Europe/Zagreb' })

  test('an edit in the native input replaces a loaded instant', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the native input is the touch-device path')
    const loaded = '2026-10-16T12:30:00.000Z' // 14:30 in Zagreb
    await mount(page, `
      <form>
        <ty-date-picker id="t" name="t" with-time locale="en-US" value="${loaded}"></ty-date-picker>
        <ty-date-picker id="d" name="d" value="${loaded}"></ty-date-picker>
      </form>`)
    await page.evaluate(() => {
      document.getElementById('t')!.addEventListener('change', (e: any) => { (window as any).__detail = e.detail.value })
    })
    await pick(page, 't', 20, '15:00')
    expect(await page.evaluate(() => (window as any).__detail)).toBe('2026-10-20T13:00:00.000Z')
    expect(await valueOf(page, 't')).toBe('2026-10-20T13:00:00.000Z')
    expect((await formData(page)).t).toBe('2026-10-20T13:00:00.000Z')
    await expect(page.locator('#t .stub-text')).toContainText('October 20')

    // Date-only: the new day; with-time then shows it at the loaded time
    await pick(page, 'd', 20)
    expect(await valueOf(page, 'd')).toBe('2026-10-19T22:00:00.000Z')
    await page.locator('#d').evaluate((el: any) => { el.withTime = true })
    expect(await valueOf(page, 'd')).toBe('2026-10-20T12:30:00.000Z')
  })
})

// The popup calendar read year "99" as no year and stayed on the previous month
test('the popup opens on a value set from code, years below 100 included', async ({ page, isMobile }) => {
  test.skip(isMobile, 'touch devices get the native input, no popup')
  await mount(page, `<ty-date-picker id="d" locale="en-US" value="2026-09-24"></ty-date-picker>`)
  const d = page.locator('#d')
  const grid = page.locator('#d ty-calendar-month [role="grid"]')
  const selected = page.locator('#d ty-calendar-month .calendar-day-cell.selected')
  for (const [v, month, day] of [['0099-05-05', 'May 99', 'May 5, 99'], ['2024-03-07', 'March 2024', 'March 7, 2024'], ['0001-01-01', 'January 1', 'January 1, 1']]) {
    await d.evaluate((el: any, v) => { el.value = v }, v)
    await expect(page.locator('#d .stub-text')).toHaveText(day)
    await page.locator('#d .date-picker-stub').click()
    await expect(grid).toHaveAttribute('aria-label', month)
    await expect(selected).toHaveAttribute('aria-label', new RegExp(`${day}$`))
    await page.keyboard.press('Escape')
    await expect(page.locator('#d .calendar-dialog')).not.toHaveAttribute('open', '')
    await page.waitForTimeout(350) // a click right after a close doesn't reopen
  }
})

test.describe('ty-date-picker keeps the focus', () => {
  /** The field's own focusable element (stub or native input) has the focus. */
  const fieldFocused = (page: Page) =>
    page.locator('#dp').evaluate((el: any) =>
      document.activeElement === el && !!el.shadowRoot.activeElement?.matches('.date-picker-stub, .native-date-input'))
  const frames = (page: Page) =>
    page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))

  test('setting or clearing error while focused; Tab then goes on from the field', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tab steps through the native date input\'s own parts')
    await mount(page, `<input id="before"><ty-date-picker id="dp"></ty-date-picker><input id="after">`)
    await page.focus('#before')
    await page.keyboard.press('Tab')
    expect(await fieldFocused(page)).toBe(true)
    await page.locator('#dp').evaluate((el: any) => { el.error = 'Server says no' })
    expect(await fieldFocused(page), 'error set').toBe(true)
    await page.locator('#dp').evaluate((el: any) => { el.error = '' })
    expect(await fieldFocused(page), 'error cleared').toBe(true)
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.activeElement?.id)).toBe('after')
  })

  test('Enter on the focused clear button clears the value, not opens the calendar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'touch devices use the native input, no popup')
    await mount(page, `<ty-date-picker id="dp" value="2026-10-16"></ty-date-picker>`)
    await page.locator('#dp .stub-clear').focus()
    await page.keyboard.press('Enter')
    await frames(page)
    expect(await valueOf(page, 'dp')).toBe(null)
    await expect(page.locator('#dp .calendar-dialog')).not.toHaveAttribute('open', '')
    expect(await fieldFocused(page)).toBe(true)
  })

  test('focus() on a disabled picker does nothing, like a disabled input', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" disabled></ty-date-picker>`)
    const focused = await page.locator('#dp').evaluate((el: any) => {
      el.focus()
      return document.activeElement === el || !!el.shadowRoot.activeElement
    })
    expect(focused).toBe(false)
  })
})

test.describe('ty-date-picker focus after the popup closes', () => {
  /** Class of the deepest focused element, through shadow roots, and its host's id. */
  const deepFocus = (page: Page) =>
    page.evaluate(() => {
      let a: Element | null = document.activeElement
      let host = ''
      while (a?.shadowRoot?.activeElement) { host = a.id; a = a.shadowRoot.activeElement }
      return `${host} ${a?.className ?? ''}`
    })

  for (const inModal of [false, true]) {
    test(`a pick and Escape return focus to the field${inModal ? ' inside ty-modal' : ''}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'touch devices use the native input, no popup')
      const picker = `<ty-date-picker id="dp" value="2026-10-01"></ty-date-picker>`
      await mount(page, inModal
        ? `<ty-modal id="m"><div style="width: 360px; padding: 24px; background: #fff;">${picker}</div></ty-modal>`
        : picker)
      if (inModal) {
        await page.evaluate(() => document.getElementById('m')!.setAttribute('open', 'true'))
        await expect.poll(() => page.evaluate(() => !!document.getElementById('m')!.shadowRoot!.querySelector('dialog')!.open)).toBe(true)
      }
      await pick(page, 'dp', 16)
      await expect.poll(() => deepFocus(page)).toBe('dp date-picker-stub')

      // The focused field opens again from the keyboard (after the 300ms
      // reopen guard that follows a close, see handleStubClick)
      await page.waitForTimeout(350)
      await page.keyboard.press('Enter')
      await expect(page.locator('#dp .calendar-dialog')).toHaveAttribute('open', '')
      await page.keyboard.press('Escape')
      await expect(page.locator('#dp .calendar-dialog')).not.toHaveAttribute('open', '')
      await expect.poll(() => deepFocus(page)).toBe('dp date-picker-stub')
      if (inModal) {
        expect(await page.evaluate(() => document.getElementById('m')!.shadowRoot!.querySelector('dialog')!.open)).toBe(true)
      }
    })
  }
})

test.describe('ty-date-picker required', () => {
  test('submit: no submit, the message shows under the field, the field takes focus', async ({ page }) => {
    const logs: string[] = []
    page.on('console', (m) => logs.push(m.text()))
    await mount(page, `
      <form>
        <ty-date-picker id="dp" name="when" label="When" required></ty-date-picker>
        <button id="go">Go</button>
      </form>`)
    await page.evaluate(() => {
      const w = window as any
      w.__submits = 0
      document.querySelector('form')!.addEventListener('submit', (e) => { e.preventDefault(); w.__submits++ })
    })
    await page.click('#go')

    expect(await page.evaluate(() => (window as any).__submits)).toBe(0)
    const message = await page.locator('#dp').evaluate((el: any) => el.validationMessage as string)
    expect(message).not.toBe('')
    await expect(page.locator('#dp .error-message')).toHaveText(message)
    const focused = await page.evaluate(() => {
      const host = document.activeElement as HTMLElement
      const inner = host?.shadowRoot?.activeElement
      return host?.id === 'dp' && !!inner && inner.matches('.date-picker-stub, .native-date-input')
    })
    expect(focused).toBe(true)
    expect(logs.filter((l) => l.includes('not focusable'))).toEqual([])

    await pick(page, 'dp', 1)
    await expect(page.locator('#dp .error-message')).toHaveCount(0)
  })
})
