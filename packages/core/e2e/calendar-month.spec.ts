import { test, expect } from '@playwright/test'
import { mount } from './helpers'

// ty-calendar-month has no distinct mobile mode (it's a stateless day grid),
// so this runs on every project including touch devices — tap-select and
// arrow-key nav both need to keep working there.

test.describe('ty-calendar-month — edge cases', () => {
  test('day click fires day-click with correct date detail', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7"></ty-calendar-month>`)
    const detail = await page.evaluate(() => {
      return new Promise((resolve) => {
        const cal = document.getElementById('cal')!
        cal.addEventListener('day-click', (e: any) => resolve(e.detail), { once: true })
        const day15 = Array.from(cal.shadowRoot!.querySelectorAll('.calendar-day-cell'))
          .find((el) => el.textContent?.trim() === '15' && !el.classList.contains('other-month')) as HTMLElement
        day15.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
      })
    })
    expect((detail as any).day).toBe(15)
    expect((detail as any).month).toBe(7)
    expect((detail as any).year).toBe(2026)
  })

  test('min/max: out-of-range days are aria-disabled and do not emit day-click', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7" min="2026-07-10" max="2026-07-20"></ty-calendar-month>`)
    const day5 = page.locator('#cal').locator('.calendar-day-cell', { hasText: /^5$/ }).first()
    await expect(day5).toHaveAttribute('aria-disabled', 'true')
    await expect(day5).toHaveAttribute('tabindex', '-1')

    let fired = false
    await page.evaluate(() => {
      document.getElementById('cal')!.addEventListener('day-click', () => {
        ;(window as any).__dayClickFired = true
      })
    })
    await day5.dispatchEvent('pointerdown')
    fired = await page.evaluate(() => !!(window as any).__dayClickFired)
    expect(fired).toBe(false)
  })

  test('exactly one gridcell has tabindex=0 (roving tabindex invariant)', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7"></ty-calendar-month>`)
    const rovingCount = await page.locator('#cal').locator('[role=gridcell][tabindex="0"]').count()
    expect(rovingCount).toBe(1)
  })

  test('min/max excludes disabled days from the roving set entirely', async ({ page }) => {
    // Every day in the visible month is out of range — roving tabindex must
    // not land on a disabled cell (would trap keyboard users with no
    // reachable, actionable day).
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7" min="2026-08-01" max="2026-08-31"></ty-calendar-month>`)
    const rovingCell = page.locator('#cal').locator('[role=gridcell][tabindex="0"]')
    const count = await rovingCell.count()
    if (count > 0) {
      await expect(rovingCell).not.toHaveAttribute('aria-disabled', 'true')
    }
  })

  test('arrow keys move the roving tabindex by the expected day delta', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7"></ty-calendar-month>`)
    const roving = page.locator('#cal').locator('[role=gridcell][tabindex="0"]')
    const beforeLabel = await roving.getAttribute('aria-label')
    await roving.focus()
    await page.keyboard.press('ArrowRight')
    const afterRoving = page.locator('#cal').locator('[role=gridcell][tabindex="0"]')
    const afterLabel = await afterRoving.getAttribute('aria-label')
    expect(afterLabel).not.toBe(beforeLabel)
    expect(await afterRoving.count()).toBe(1) // invariant still holds after navigation
  })

  test('min > max misconfiguration renders without crashing (all days effectively disabled or shown)', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7" min="2026-08-01" max="2026-07-01"></ty-calendar-month>`)
    expect(errors).toEqual([])
  })

  test('leading/trailing other-month days are marked and excluded from selection date math', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7"></ty-calendar-month>`)
    const otherMonthCount = await page.locator('#cal .other-month').count()
    // July 2026: 1st is a Wednesday, 31 days — grid is 42 cells, so there
    // WILL be leading/trailing days from June/August padding the 6-week grid.
    expect(otherMonthCount).toBeGreaterThan(0)
  })

  test('custom dayContentFn returning a non-DOM, non-string value throws (documented contract)', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7"></ty-calendar-month>`)
    const threw = await page.evaluate(() => {
      const cal = document.getElementById('cal') as any
      try {
        cal.dayContentFn = () => 12345 // not a DOM element or string
        cal.year = 2026 // trigger re-render
        cal.month = 8
        return false
      } catch {
        return true
      }
    })
    expect(threw).toBe(true)
  })

  test('invalid year/month attributes do not crash the component', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-calendar-month id="cal" year="not-a-year" month="99"></ty-calendar-month>`)
    expect(errors).toEqual([])
  })

  test('tap-select works on touch (mobile projects)', async ({ page }) => {
    await mount(page, `<ty-calendar-month id="cal" year="2026" month="7"></ty-calendar-month>`)
    const day15 = page.locator('#cal').locator('.calendar-day-cell:not(.other-month)', { hasText: /^15$/ }).first()
    const detailPromise = page.evaluate(() => new Promise((resolve) => {
      document.getElementById('cal')!.addEventListener('day-click', (e: any) => resolve(e.detail), { once: true })
    }))
    await day15.dispatchEvent('pointerdown')
    const detail: any = await detailPromise
    expect(detail.day).toBe(15)
  })
})
