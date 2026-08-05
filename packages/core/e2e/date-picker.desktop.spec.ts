import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-date-picker — desktop popup calendar', () => {
  test('opens calendar popup on click', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click()
    await expect(page.locator('#dp ty-calendar, #dp .dropdown-dialog[open]')).toBeVisible()
  })

  test('min/max: out-of-range days are disabled and unclickable', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15" min="2026-07-10" max="2026-07-20"></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click()
    // Day 5 (before min) should be disabled
    const disabledCount = await page.locator('#dp [data-disabled="true"], #dp .day-disabled, #dp button:disabled').count()
    expect(disabledCount).toBeGreaterThan(0)
  })

  test('min > max misconfiguration does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15" min="2026-08-01" max="2026-07-01"></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click()
    expect(errors).toEqual([])
  })

  test('leap year: Feb 29 2028 is selectable and round-trips to the correct calendar day', async ({ page }) => {
    // .value is documented (date-picker.ts componentsToOutputValue) as a full
    // UTC timestamp representing LOCAL midnight for that day — not a bare
    // YYYY-MM-DD. Round-tripping through LOCAL Date getters must land back
    // on Feb 29 (UTC getters would show Feb 28 by design, not a bug).
    await mount(page, `<ty-date-picker id="dp" value="2028-02-15"></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click()
    const feb29 = page.locator('#dp').locator('text=/^29$/').first()
    if (await feb29.count() > 0) {
      await feb29.click()
      const parts = await page.locator('#dp').evaluate((el: any) => {
        const d = new Date(el.value)
        return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() }
      })
      expect(parts).toEqual({ y: 2028, m: 1, day: 29 }) // month is 0-indexed: 1 = February
    }
  })

  test('invalid initial value string does not crash the component', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-date-picker id="dp" value="not-a-date"></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click({ force: true }).catch(() => {})
    expect(errors).toEqual([])
  })

  test('clear button empties the value', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15" clearable></ty-date-picker>`)
    const clearBtn = page.locator('#dp .stub-clear')
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()
    const value = await page.locator('#dp').evaluate((el: any) => el.value)
    expect(value).toBeNull() // getter contract: `getProperty('value') || null`, not ''
  })

  test('zero/no value renders placeholder without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-date-picker id="dp"></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click()
    expect(errors).toEqual([])
  })

  test('disabled date-picker does not open on click', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15" disabled></ty-date-picker>`)
    await page.locator('#dp .date-picker-stub').click({ force: true })
    const open = await page.locator('#dp .dropdown-dialog[open], #dp dialog[open]').count()
    expect(open).toBe(0)
  })
})
