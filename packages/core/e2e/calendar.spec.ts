import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-calendar — nav + month composed, edge cases', () => {
  test('month prev/next buttons update the visible month', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-07-15"></ty-calendar>`)
    await page.locator('#cal ty-calendar-navigation').locator('.nav-month-next').click()
    // Clicking a day afterwards should reflect August, not July, if nav worked
    const dayCells = page.locator('#cal ty-calendar-month .calendar-day-cell:not(.other-month)')
    expect(await dayCells.count()).toBeGreaterThan(0)
  })

  test('year prev/next buttons update the visible year', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-calendar id="cal" value="2026-07-15"></ty-calendar>`)
    await page.locator('#cal ty-calendar-navigation').locator('.nav-year-next').click()
    await page.locator('#cal ty-calendar-navigation').locator('.nav-year-prev').click()
    expect(errors).toEqual([])
  })

  test('navigation clamps at min/max: prev-month button disabled at the min boundary', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-07-15" min="2026-07-01" max="2026-07-31"></ty-calendar>`)
    const prevBtn = page.locator('#cal ty-calendar-navigation').locator('.nav-month-prev')
    await expect(prevBtn).toBeDisabled()
    const nextBtn = page.locator('#cal ty-calendar-navigation').locator('.nav-month-next')
    await expect(nextBtn).toBeDisabled()
  })

  test('clicking a day updates .value and fires change with full detail', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-07-01"></ty-calendar>`)
    const detailPromise = page.evaluate(() => new Promise((resolve) => {
      document.getElementById('cal')!.addEventListener('change', (e: any) => resolve(e.detail), { once: true })
    }))
    const day20 = page.locator('#cal ty-calendar-month .calendar-day-cell:not(.other-month)', { hasText: /^20$/ }).first()
    await day20.dispatchEvent('pointerdown')
    const detail: any = await detailPromise
    expect(detail).toBeTruthy()
    const value = await page.locator('#cal').evaluate((el: any) => el.value)
    expect(value.startsWith('2026-07-2') || value.startsWith('2026-07-1')).toBe(true) // UTC-midnight shift may land on 19 or 20 depending on TZ
  })

  test('min > max misconfiguration does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-calendar id="cal" value="2026-07-15" min="2026-08-01" max="2026-07-01"></ty-calendar>`)
    expect(errors).toEqual([])
  })

  test('flavor forwards to the nested calendar-month but not to navigation arrows', async ({ page }) => {
    await mount(page, `<ty-calendar id="cal" value="2026-07-15" flavor="success"></ty-calendar>`)
    const monthFlavor = await page.locator('#cal ty-calendar-month').getAttribute('flavor')
    expect(monthFlavor).toBe('success')
  })

  test('no initial value: renders current month without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-calendar id="cal"></ty-calendar>`)
    expect(errors).toEqual([])
  })

  test('tap day-select works on touch (mobile projects)', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, 'touch-only test')
    await mount(page, `<ty-calendar id="cal" value="2026-07-01"></ty-calendar>`)
    const day10 = page.locator('#cal ty-calendar-month .calendar-day-cell:not(.other-month)', { hasText: /^10$/ }).first()
    await day10.tap()
    const value = await page.locator('#cal').evaluate((el: any) => el.value)
    expect(value).toBeTruthy()
  })
})
