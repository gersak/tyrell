import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-date-picker — mobile native input', () => {
  test('renders a native <input type="date"> instead of the calendar popup', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`)
    const nativeInput = page.locator('#dp .native-date-input')
    await expect(nativeInput).toBeAttached()
    await expect(nativeInput).toHaveAttribute('type', 'date')
  })

  test('min/max attributes are applied to the native input', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15" min="2026-07-10" max="2026-07-20"></ty-date-picker>`)
    const nativeInput = page.locator('#dp .native-date-input')
    await expect(nativeInput).toHaveAttribute('min', '2026-07-10')
    await expect(nativeInput).toHaveAttribute('max', '2026-07-20')
  })

  test('native input value reflects the initial date value', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`)
    const nativeVal = await page.locator('#dp .native-date-input').inputValue()
    expect(nativeVal).toBe('2026-07-15')
  })

  test('changing the native input updates the component value', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15"></ty-date-picker>`)
    await page.locator('#dp .native-date-input').fill('2026-08-20')
    await page.locator('#dp .native-date-input').dispatchEvent('change')
    const parts = await page.locator('#dp').evaluate((el: any) => {
      const d = new Date(el.value)
      return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() }
    })
    expect(parts).toEqual({ y: 2026, m: 7, day: 20 }) // August = month 7
  })

  test('disabled propagates to the native input', async ({ page }) => {
    await mount(page, `<ty-date-picker id="dp" value="2026-07-15" disabled></ty-date-picker>`)
    await expect(page.locator('#dp .native-date-input')).toBeDisabled()
  })

  test('no value: native input is empty, no crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-date-picker id="dp"></ty-date-picker>`)
    const val = await page.locator('#dp .native-date-input').inputValue()
    expect(val).toBe('')
    expect(errors).toEqual([])
  })

  test('invalid initial value does not crash on mobile either', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-date-picker id="dp" value="not-a-date"></ty-date-picker>`)
    expect(errors).toEqual([])
  })
})
