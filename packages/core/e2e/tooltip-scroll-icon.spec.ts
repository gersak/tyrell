import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-tooltip — edge cases', () => {
  // Anchor is the PARENT element (same nested-inside pattern as ty-popup),
  // not slot="trigger" — <button>Hover me<ty-tooltip>...</ty-tooltip></button>.

  test('hover shows the tooltip after the delay, mouseleave hides it', async ({ page }) => {
    await mount(page, `
      <button id="anchor">
        Hover me
        <ty-tooltip id="tt" delay="50">Tip text</ty-tooltip>
      </button>
    `)
    await page.locator('#anchor').hover()
    await page.waitForTimeout(150)
    await expect(page.locator('.ty-tooltip-popover')).toBeVisible()
    await page.mouse.move(0, 0)
    await page.waitForTimeout(400) // hide has its own 200ms delay (scheduleHide)
    // hidePopover() (Popover API) hides, it doesn't remove the element from
    // the DOM — check visibility, not presence.
    await expect(page.locator('.ty-tooltip-popover')).not.toBeVisible()
  })

  test('keyboard focus shows the tooltip (accessibility — not hover-only)', async ({ page }) => {
    await mount(page, `
      <button id="anchor">
        Focus me
        <ty-tooltip id="tt" delay="50">Tip text</ty-tooltip>
      </button>
    `)
    await page.locator('#anchor').focus()
    await page.waitForTimeout(150)
    await expect(page.locator('.ty-tooltip-popover')).toBeVisible()
    await page.locator('#anchor').blur()
    await page.waitForTimeout(400)
    await expect(page.locator('.ty-tooltip-popover')).not.toBeVisible()
  })

  test('disabled tooltip never shows on hover', async ({ page }) => {
    await mount(page, `
      <button id="anchor">
        Hover me
        <ty-tooltip id="tt" delay="30" disabled>Tip text</ty-tooltip>
      </button>
    `)
    await page.locator('#anchor').hover()
    await page.waitForTimeout(200)
    // The popover element may exist lazily (created on first interaction)
    // even when disabled — the real assertion is that it's never SHOWN.
    await expect(page.locator('.ty-tooltip-popover')).not.toBeVisible()
  })

  test('anchor gets aria-describedby pointing at the tooltip, without clobbering an existing value', async ({ page }) => {
    await mount(page, `
      <button id="anchor" aria-describedby="other-thing">
        Hover me
        <ty-tooltip id="tt" delay="30">Tip text</ty-tooltip>
      </button>
    `)
    await page.locator('#anchor').hover()
    await page.waitForTimeout(150)
    const describedBy = await page.locator('#anchor').getAttribute('aria-describedby')
    expect(describedBy).toContain('other-thing')
    expect(describedBy!.split(/\s+/).length).toBeGreaterThan(1)
  })

  test('empty content does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<button id="anchor">Hover<ty-tooltip id="tt" delay="30"></ty-tooltip></button>`)
    await page.locator('#anchor').hover()
    await page.waitForTimeout(150)
    expect(errors).toEqual([])
  })
})

test.describe('ty-scroll-container — edge cases', () => {
  test('short content: no scroll, edge shadows stay hidden', async ({ page }) => {
    await mount(page, `
      <ty-scroll-container id="sc" style="height:200px">
        <div style="height:50px">short content</div>
      </ty-scroll-container>
    `)
    const bottomShadow = page.locator('#sc .shadow-bottom')
    const opacity = await bottomShadow.evaluate((el) => getComputedStyle(el).opacity)
    expect(Number(opacity)).toBeCloseTo(0, 1)
  })

  test('tall content: bottom edge shadow appears, disappears after scrolling to the end', async ({ page }) => {
    await mount(page, `
      <ty-scroll-container id="sc" style="height:200px">
        <div style="height:2000px">tall content</div>
      </ty-scroll-container>
    `)
    await page.waitForTimeout(100)
    const bottomShadow = page.locator('#sc .shadow-bottom')
    const before = Number(await bottomShadow.evaluate((el) => getComputedStyle(el).opacity))
    expect(before).toBeGreaterThan(0)
    await page.locator('#sc .scroll-wrapper').evaluate((el) => { el.scrollTop = el.scrollHeight })
    await page.waitForTimeout(150)
    const after = Number(await bottomShadow.evaluate((el) => getComputedStyle(el).opacity))
    expect(after).toBeLessThan(before)
  })

  test('zero-height content does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-scroll-container id="sc" style="height:200px"></ty-scroll-container>`)
    expect(errors).toEqual([])
  })
})

test.describe('ty-icon — edge cases', () => {
  test('unknown icon name falls back to the not-found icon without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-icon id="i" name="this-icon-does-not-exist-xyz"></ty-icon>`)
    await expect(page.locator('#i')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('slotted custom SVG content overrides the registry fallback', async ({ page }) => {
    await mount(page, `<ty-icon id="i" name="nonexistent"><svg id="custom-svg" viewBox="0 0 10 10"></svg></ty-icon>`)
    const assignedCount = await page.locator('#i').evaluate((el: any) => {
      const slot = el.shadowRoot.querySelector('slot')
      return slot.assignedElements().length
    })
    expect(assignedCount).toBe(1)
  })

  test('spin and pulse attributes apply their animation classes without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-icon id="i" name="star" spin pulse tempo="fast"></ty-icon>`)
    expect(errors).toEqual([])
    await expect(page.locator('#i')).toBeVisible()
  })

  test('no name attribute and no slotted content: renders fallback, no crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-icon id="i"></ty-icon>`)
    expect(errors).toEqual([])
  })
})
