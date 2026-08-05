import { test, expect } from '@playwright/test'
import { mount } from './helpers'

// Real device emulation (hasTouch + narrow viewport) — isMobileTouch() reads
// `(pointer: coarse) and (max-width: 768px)` and Chromium reports this
// faithfully, so ty-select genuinely renders its mobile full-screen-dialog
// mode here, not an approximation.

test.describe('ty-select — mobile full-screen dialog', () => {
  test('tap opens full-screen dialog, not desktop popup', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').tap()
    await expect(page.locator('#sel .mobile-dialog[open]')).toBeVisible()
    await expect(page.locator('#sel .dropdown-dialog[open]')).toHaveCount(0)
  })

  test('FIRST open shows all options (regression: stale hidden state)', async ({ page }) => {
    const opts = Array.from({ length: 10 }, (_, i) => `<ty-option value="v${i}">Item ${i}</ty-option>`).join('')
    await mount(page, `<ty-select id="sel" label="Items">${opts}</ty-select>`)
    await page.locator('#sel .select-stub').tap()
    const visible = await page.locator('#sel ty-option:not([hidden])').count()
    expect(visible).toBe(10)
    await expect(page.locator('#sel .mobile-available-section')).toHaveAttribute('data-empty', 'false')
  })

  test('search input is genuinely DOM-focused on open (regression: focus race)', async ({ page }) => {
    const opts = Array.from({ length: 10 }, (_, i) => `<ty-option value="v${i}">Item ${i}</ty-option>`).join('')
    await mount(page, `<ty-select id="sel" label="Items">${opts}</ty-select>`)
    await page.locator('#sel .select-stub').tap()
    const isFocused = await page.locator('#sel .mobile-search-input').evaluate((el) => {
      const root = (el.getRootNode() as ShadowRoot)
      return root.activeElement === el
    })
    expect(isFocused).toBe(true)
  })

  test('typing on first open filters options immediately', async ({ page }) => {
    const opts = Array.from({ length: 10 }, (_, i) => `<ty-option value="v${i}">Item ${i}</ty-option>`).join('')
    await mount(page, `<ty-select id="sel" label="Items">${opts}</ty-select>`)
    await page.locator('#sel .select-stub').tap()
    await page.locator('#sel .mobile-search-input').fill('Item 5')
    const visible = await page.locator('#sel ty-option:not([hidden])').count()
    expect(visible).toBe(1)
  })

  test('close then reopen: second open still shows all options', async ({ page }) => {
    const opts = Array.from({ length: 10 }, (_, i) => `<ty-option value="v${i}">Item ${i}</ty-option>`).join('')
    await mount(page, `<ty-select id="sel" label="Items">${opts}</ty-select>`)
    const stub = page.locator('#sel .select-stub')
    await stub.tap()
    await page.locator('#sel .mobile-search-input').fill('Item 5')
    await page.locator('#sel .mobile-close-button').tap()
    await expect(page.locator('#sel .mobile-dialog[open]')).toHaveCount(0)
    await stub.tap()
    const visible = await page.locator('#sel ty-option:not([hidden])').count()
    expect(visible).toBe(10)
  })

  test('multi-select: tap to select, tap again to deselect', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" multiple label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').tap()
    const apple = page.locator('#sel ty-option[value=a]')
    await apple.tap()
    expect(await page.locator('#sel').evaluate((el: any) => el.value)).toBe('a')
    await apple.tap()
    expect(await page.locator('#sel').evaluate((el: any) => el.value)).toBe('')
  })

  test('single-select: tapping an option closes the dialog', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').tap()
    await page.locator('#sel ty-option[value=a]').tap()
    await expect(page.locator('#sel .mobile-dialog[open]')).toHaveCount(0)
    expect(await page.locator('#sel').evaluate((el: any) => el.value)).toBe('a')
  })

  test('close button closes the dialog', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').tap()
    await page.locator('#sel .mobile-close-button').tap()
    await expect(page.locator('#sel .mobile-dialog[open]')).toHaveCount(0)
  })

  test('external-search: results become visible after typing (regression: stuck data-empty)', async ({ page }) => {
    await mount(page, `<ty-select id="sel" external-search label="Robot"></ty-select>`)
    await page.evaluate(() => {
      const el = document.getElementById('sel')!
      el.addEventListener('search', (e: any) => {
        const q = (e.detail.query || '').toLowerCase()
        ;(el as any).loading = true
        el.querySelectorAll('ty-option').forEach((o) => o.remove())
        ;['Bobo Robot', 'Rob Roy', 'Robusta Grinder'].filter((r) => r.toLowerCase().includes(q)).forEach((r, i) => {
          const o = document.createElement('ty-option')
          o.setAttribute('value', 'r' + i)
          o.textContent = r
          el.appendChild(o)
        })
        ;(el as any).loading = false
      })
    })
    await page.locator('#sel .select-stub').tap()
    // openMobileModal() deliberately fires an initial empty-query `search`
    // event for external-search (see its "also fires empty search" comment),
    // so this demo handler (query.includes('') matches everything) populates
    // all 3 immediately — that's correct, not the bug being regression-tested.
    await expect(page.locator('#sel .mobile-available-section')).toHaveAttribute('data-empty', 'false')
    expect(await page.locator('#sel ty-option').count()).toBe(3)
    // The actual regression: narrowing the query must still leave real
    // results visible afterward, not stuck hidden behind a stale data-empty.
    await page.locator('#sel .mobile-search-input').fill('rob')
    await expect(page.locator('#sel .mobile-available-section')).toHaveAttribute('data-empty', 'false')
    const slotDisplay = await page.locator('#sel .mobile-available-section slot').first().evaluate((el) => getComputedStyle(el).display)
    expect(slotDisplay).not.toBe('none')
    const optionCount = await page.locator('#sel ty-option').count()
    expect(optionCount).toBe(3)
    // Narrow to a query with ZERO matches — data-empty must flip back to
    // true and the slot must hide again (proves the observer-driven refresh
    // isn't a one-way "always show" patch).
    await page.locator('#sel .mobile-search-input').fill('zzznomatch')
    await expect(page.locator('#sel .mobile-available-section')).toHaveAttribute('data-empty', 'true')
  })

  test('custom trigger (slot="trigger") works on mobile too', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel">
        <ty-button slot="trigger">Open</ty-button>
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    await page.locator('#sel [slot=trigger]').tap()
    await expect(page.locator('#sel .mobile-dialog[open]')).toBeVisible()
  })

  test('zero options: opens without crashing, empty state visible, no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-select id="sel" label="Empty"></ty-select>`)
    await page.locator('#sel .select-stub').tap()
    await expect(page.locator('#sel .mobile-dialog[open]')).toBeVisible()
    await expect(page.locator('#sel .empty-state')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('disabled select does not open on tap', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" disabled label="Fruit">
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').tap({ force: true })
    await expect(page.locator('#sel .mobile-dialog[open]')).toHaveCount(0)
  })

  test('rapid tap-tap on stub does not open two dialogs or throw', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
      </ty-select>
    `)
    const stub = page.locator('#sel .select-stub')
    await stub.tap()
    await stub.tap({ force: true })
    expect(await page.locator('#sel .mobile-dialog[open]').count()).toBeLessThanOrEqual(1)
    expect(errors).toEqual([])
  })

  test('search row hidden entirely when below auto-search threshold (few options)', async ({ page }) => {
    await mount(page, `
      <ty-select id="sel" label="Fruit">
        <ty-option value="a">Apple</ty-option>
        <ty-option value="b">Banana</ty-option>
      </ty-select>
    `)
    await page.locator('#sel .select-stub').tap()
    await expect(page.locator('#sel .mobile-search-input')).toBeHidden()
    // close button should still be reachable and flush right (regression: stranded-left bug)
    const closeBtn = page.locator('#sel .mobile-close-button')
    await expect(closeBtn).toBeVisible()
  })
})
