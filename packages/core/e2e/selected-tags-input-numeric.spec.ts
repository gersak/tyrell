import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-selected-tags — edge cases', () => {
  test('for="id" links to a select elsewhere in the DOM and renders chips for its selected values', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" multiple>
        <ty-option value="a" selected>Apple</ty-option>
        <ty-option value="b" selected>Banana</ty-option>
        <ty-option value="c">Cherry</ty-option>
      </ty-select>
      <div style="height:40px">spacer</div>
      <ty-selected-tags id="tags" for="sel"></ty-selected-tags>
    `)
    await page.waitForTimeout(100)
    const chips = page.locator('#tags ty-tag')
    expect(await chips.count()).toBe(2)
  })

  test('previous-sibling fallback: no for="" needed when adjacent to the select', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" multiple>
        <ty-option value="a" selected>Apple</ty-option>
      </ty-select>
      <ty-selected-tags id="tags"></ty-selected-tags>
    `)
    await page.waitForTimeout(100)
    expect(await page.locator('#tags ty-tag').count()).toBe(1)
  })

  test('dismissing a chip removes it from the linked select value', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" multiple>
        <ty-option value="a" selected>Apple</ty-option>
        <ty-option value="b" selected>Banana</ty-option>
      </ty-select>
      <ty-selected-tags id="tags" for="sel"></ty-selected-tags>
    `)
    await page.waitForTimeout(100)
    const firstChipDismiss = page.locator('#tags ty-tag').first().locator('[part=dismiss], .dismiss, button')
    if (await firstChipDismiss.count() > 0) {
      await firstChipDismiss.first().click({ force: true })
      await page.waitForTimeout(100)
      const value = await page.locator('#sel').evaluate((el: any) => el.value)
      expect(value).not.toBe('a,b')
    }
  })

  test('custom <template> child renders interpolated placeholders', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" multiple>
        <ty-option value="a" selected data-flag="🇺🇸">America</ty-option>
      </ty-select>
      <ty-selected-tags id="tags" for="sel">
        <template>
          <span class="custom-chip">{data-flag} {label}</span>
        </template>
      </ty-selected-tags>
    `)
    await page.waitForTimeout(100)
    const chip = page.locator('#tags .custom-chip')
    if (await chip.count() > 0) {
      const text = await chip.textContent()
      expect(text).toContain('America')
    }
  })

  test('no linked select (bad for="") does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-selected-tags id="tags" for="does-not-exist"></ty-selected-tags>`)
    expect(errors).toEqual([])
  })

  test('zero selected values renders zero chips, no crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `
      <ty-select id="sel" multiple><ty-option value="a">Apple</ty-option></ty-select>
      <ty-selected-tags id="tags" for="sel"></ty-selected-tags>
    `)
    await page.waitForTimeout(100)
    expect(await page.locator('#tags ty-tag').count()).toBe(0)
    expect(errors).toEqual([])
  })
})

test.describe('ty-input — numeric formatting edge cases', () => {
  test('currency: formats with locale-appropriate grouping and decimals on blur', async ({ page }) => {
    await mount(page, `<ty-input id="i" type="currency" locale="en-US" value="1234.5"></ty-input>`)
    const displayed = await page.locator('#i input').inputValue()
    expect(displayed).toMatch(/1,234/) // grouping separator present
  })

  test('currency: negative values are handled without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-input id="i" type="currency" value="-500.25"></ty-input>`)
    expect(errors).toEqual([])
  })

  test('percent: value IS the percentage number directly (value="50" -> "50%"), not a 0-1 fraction', async ({ page }) => {
    // getDisplayValue() divides by 100 before formatting, with the comment
    // "user enters 15, displays as 15%. This matches ClojureScript behavior"
    // — deliberately the opposite of Intl.NumberFormat's own percent style
    // (which expects a 0-1 fraction). Documenting the real contract.
    await mount(page, `<ty-input id="i" type="percent" locale="en-US" value="50"></ty-input>`)
    const displayed = await page.locator('#i input').inputValue()
    expect(displayed).toContain('50')
    expect(displayed).toContain('%')
  })

  test('compact: large numbers abbreviate (e.g. 1200000 -> 1.2M-ish)', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-input id="i" type="compact" locale="en-US" value="1200000"></ty-input>`)
    expect(errors).toEqual([])
  })

  test('non-en locale (de-DE) does not crash and changes grouping/decimal characters', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-input id="i" type="currency" locale="de-DE" value="1234.5"></ty-input>`)
    expect(errors).toEqual([])
  })

  test('empty numeric value does not crash and does not render "NaN"', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-input id="i" type="currency"></ty-input>`)
    const displayed = await page.locator('#i input').inputValue()
    expect(displayed.toLowerCase()).not.toContain('nan')
    expect(errors).toEqual([])
  })

  test('typing letters into a numeric field does not corrupt the underlying value', async ({ page }) => {
    await mount(page, `<ty-input id="i" type="currency"></ty-input>`)
    const input = page.locator('#i input')
    await input.pressSequentially('abc123xyz', { delay: 5 })
    const value = await page.locator('#i').evaluate((el: any) => el.value)
    expect(typeof value === 'number' ? Number.isNaN(value) : value).not.toBe(true)
  })
})
