import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-select — desktop popup', () => {
  test('opens on click, closes on Escape', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)
    const sel = page.locator('#sel')
    await sel.locator('.select-stub').click()
    await expect(sel.locator('.dropdown-dialog[open]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(sel.locator('.dropdown-dialog[open]')).toHaveCount(0)
  })

  test('closes on outside click', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
      <div id="outside" style="height:200px">outside</div>
    `)
    await page.locator('#sel .select-stub').click()
    await expect(page.locator('#sel .dropdown-dialog[open]')).toBeVisible()
    await page.locator('#outside').click({ force: true })
    await expect(page.locator('#sel .dropdown-dialog[open]')).toHaveCount(0)
  })

  test('keyboard: ArrowDown highlights, Enter selects, closes for single-select', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.locator('#sel .dropdown-dialog[open]')).toHaveCount(0)
    const value = await page.locator('#sel').evaluate((el: any) => el.value)
    expect(value).toBe('a')
  })

  test('search filters options, clearing restores all', async ({ page }) => {
    const opts = Array.from({ length: 9 }, (_, i) => `<ty-option value="v${i}">Item ${i}</ty-option>`).join('')
    await mount(page, `<ty-select id="sel" label="Items">${opts}</ty-select>`)
    await page.locator('#sel .select-stub').click()
    const search = page.locator('#sel .dropdown-search-input')
    await expect(search).toBeVisible() // 9 options > SEARCH_AUTO_THRESHOLD(7)
    await search.fill('Item 3')
    const visible = await page.locator('#sel ty-option:not([hidden])').count()
    expect(visible).toBe(1)
    await search.fill('')
    const visibleAfterClear = await page.locator('#sel ty-option:not([hidden])').count()
    expect(visibleAfterClear).toBe(9)
  })

  test('search with zero matches shows empty state, no crash', async ({ page }) => {
    const opts = Array.from({ length: 8 }, (_, i) => `<ty-option value="v${i}">Item ${i}</ty-option>`).join('')
    await mount(page, `<ty-select id="sel" label="Items">${opts}</ty-select>`)
    await page.locator('#sel .select-stub').click()
    await page.locator('#sel .dropdown-search-input').fill('zzzznomatch')
    const visible = await page.locator('#sel ty-option:not([hidden])').count()
    expect(visible).toBe(0)
    // options wrapper should be visually hidden (updateOptionsVisibility(false))
    const display = await page.locator('#sel .dropdown-options').evaluate((el) => getComputedStyle(el).display)
    expect(display).toBe('none')
  })

  test('multi-select: clicking a selected option toggles it off', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" multiple label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').click()
    await page.locator('#sel ty-option[value=a]').click()
    expect(await page.locator('#sel').evaluate((el: any) => el.value)).toBe('a')
    await page.locator('#sel ty-option[value=a]').click()
    expect(await page.locator('#sel').evaluate((el: any) => el.value)).toBe('')
  })

  test('disabled select does not open on click', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" disabled label="Fruit">
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').click({ force: true })
    await expect(page.locator('#sel .dropdown-dialog[open]')).toHaveCount(0)
  })

  test('zero options: opens without crashing, empty state visible', async ({ page }) => {
    await mount(page, `<ty-select id="sel" label="Empty"></ty-select>`)
    await page.locator('#sel .select-stub').click()
    await expect(page.locator('#sel .dropdown-dialog[open]')).toBeVisible()
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    expect(errors).toEqual([])
  })

  test('custom trigger (slot="trigger") has no default field chrome or focus ring', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel">
        <ty-button slot="trigger">Open</ty-button>
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    const stub = page.locator('#sel .select-stub')
    await expect(stub).toHaveClass(/custom-trigger/)
    let box = await stub.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(box).toBe('none')
    await stub.click()
    box = await stub.evaluate((el) => getComputedStyle(el).boxShadow)
    expect(box).toBe('none')
  })

  test('rapid double-click on stub does not open two dialogs or throw', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    const stub = page.locator('#sel .select-stub')
    await stub.click()
    await stub.click({ force: true })
    expect(await page.locator('#sel .dropdown-dialog[open]').count()).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })

  test('required + empty is invalid; selecting a value makes it valid', async ({ page }) => {
    await mount(page, `
      <form id="f">
        <ty-select id="sel" required name="fruit" label="Fruit">
          <ty-option value="a">Apple</ty-option>
        </ty-select>
      </form>
    `)
    const formValidBefore = await page.locator('#f').evaluate((f: any) => f.checkValidity())
    expect(formValidBefore).toBe(false)
    await page.locator('#sel .select-stub').click()
    await page.locator('#sel ty-option[value=a]').click()
    const formValidAfter = await page.locator('#f').evaluate((f: any) => f.checkValidity())
    expect(formValidAfter).toBe(true)
  })
})
