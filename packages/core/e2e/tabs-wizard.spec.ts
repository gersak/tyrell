import { test, expect } from '@playwright/test'
import { mount } from './helpers'

test.describe('ty-tabs — keyboard edge cases', () => {
  test('click activates a tab and shows its panel', async ({ page }) => {
    await mount(page, `
      <ty-tabs id="t">
        <ty-tab id="a" label="A">Content A</ty-tab>
        <ty-tab id="b" label="B">Content B</ty-tab>
      </ty-tabs>
    `)
    await page.locator('#t .tab-button').nth(1).click()
    await expect(page.locator('#t .tab-button').nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('Enter on a focused tab button activates it (regression: was pointerdown-only, keyboard users had no way to activate a tab — WCAG 2.1.1)', async ({ page }) => {
    // Fixed by adding a 'click' listener gated on event.detail === 0 (native
    // keyboard-triggered clicks report detail 0; real pointer clicks report
    // >=1), alongside the existing 'pointerdown' — avoids double-firing
    // setActiveTab() on an actual mouse/touch click while covering Enter/Space.
    await mount(page, `
      <ty-tabs id="t">
        <ty-tab id="a" label="A">Content A</ty-tab>
        <ty-tab id="b" label="B">Content B</ty-tab>
      </ty-tabs>
    `)
    await page.locator('#t .tab-button').nth(1).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('#t .tab-button').nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('a real pointer click fires ty-tab-change exactly once (no double-fire from pointerdown + the new click listener)', async ({ page }) => {
    await mount(page, `
      <ty-tabs id="t">
        <ty-tab id="a" label="A">Content A</ty-tab>
        <ty-tab id="b" label="B">Content B</ty-tab>
      </ty-tabs>
    `)
    await page.evaluate(() => {
      ;(window as any).__count = 0
      document.getElementById('t')!.addEventListener('ty-tab-change', () => { (window as any).__count++ })
    })
    await page.locator('#t .tab-button').nth(1).click()
    await page.waitForTimeout(100)
    const count = await page.evaluate(() => (window as any).__count)
    expect(count).toBe(1)
  })

  test('BUG: role="tablist"/role="tab" + roving tabindex present, but ArrowRight does not move focus/selection to the next tab', async ({ page }) => {
    // WAI-ARIA APG requires arrow-key navigation for the tablist pattern once
    // role="tab"/"tablist" is used — screen readers tell users to expect it.
    // tabindex alternates 0/-1 per tab (roving-tabindex markup is present),
    // which only makes sense if something moves it on keydown — but tabs.ts
    // has zero keydown handling (grepped, confirmed). This proves the gap.
    await mount(page, `
      <ty-tabs id="t">
        <ty-tab id="a" label="A">Content A</ty-tab>
        <ty-tab id="b" label="B">Content B</ty-tab>
      </ty-tabs>
    `)
    const first = page.locator('#t .tab-button').nth(0)
    const second = page.locator('#t .tab-button').nth(1)
    await first.focus()
    await page.keyboard.press('ArrowRight')
    const secondSelectedAfterArrow = await second.getAttribute('aria-selected')
    const secondTabindexAfterArrow = await second.getAttribute('tabindex')
    // Documents current (buggy) behavior: neither selection nor roving
    // tabindex moves. If this ever starts failing because someone implements
    // arrow-key nav, that's the fix landing — update/remove this test then.
    expect(secondSelectedAfterArrow).toBe('false')
    expect(secondTabindexAfterArrow).toBe('-1')
  })

  test('disabled tab is unreachable via click and is not aria-selected', async ({ page }) => {
    await mount(page, `
      <ty-tabs id="t">
        <ty-tab id="a" label="A">Content A</ty-tab>
        <ty-tab id="b" label="B" disabled>Content B</ty-tab>
      </ty-tabs>
    `)
    await page.locator('#t .tab-button').nth(1).click({ force: true })
    await expect(page.locator('#t .tab-button').nth(1)).toHaveAttribute('aria-selected', 'false')
  })

  test('single tab does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-tabs id="t"><ty-tab id="a" label="Only">Content</ty-tab></ty-tabs>`)
    expect(errors).toEqual([])
  })
})

test.describe('ty-tabs — overflow menu', () => {
  const manyTabs = Array.from({ length: 6 }, (_, i) =>
    `<ty-tab id="tab${i}" label="Tab ${i}">Content ${i}</ty-tab>`
  ).join('')

  test('all tabs fit: no overflow trigger appears', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="900px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    expect(await page.locator('#t .tab-overflow-trigger').count()).toBe(0)
    expect(await page.locator('#t .tab-button.overflow-hidden').count()).toBe(0)
  })

  test('narrow container: excess tabs collapse behind a "more" trigger', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="300px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    await expect(page.locator('#t .tab-overflow-trigger')).toBeVisible()
    const hiddenCount = await page.locator('#t .tab-button.overflow-hidden').count()
    expect(hiddenCount).toBeGreaterThan(0)
    // At least one tab stays visible alongside the trigger.
    const visibleCount = await page.locator('#t .tab-button:not(.overflow-hidden)').count()
    expect(visibleCount).toBeGreaterThan(0)
  })

  test('selecting a tab from the overflow menu activates it and keeps it visible', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="300px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    await page.locator('#t .tab-overflow-trigger').click()
    const lastItem = page.locator('#t .tab-overflow-item').last()
    await expect(lastItem).toBeVisible()
    const label = await lastItem.textContent()
    await lastItem.click()
    await page.waitForTimeout(100)
    const activeButton = page.locator('#t .tab-button[aria-selected="true"]')
    await expect(activeButton).toHaveText(label!.trim())
    await expect(activeButton).not.toHaveClass(/overflow-hidden/)
  })

  test('shrinking the width attribute at runtime updates the overflow set', async ({ page }) => {
    // (A separate, pre-existing quirk: a width="100%" ty-tabs pins its host
    // width to a fixed px snapshot on first ResizeObserver tick, so it stops
    // tracking further ancestor resizes. Not exercised here — this test
    // drives overflow recompute via the width ATTRIBUTE instead, which goes
    // through render()'s smart-update path directly on every change.)
    await mount(page, `<ty-tabs id="t" width="900px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    expect(await page.locator('#t .tab-overflow-trigger').count()).toBe(0)
    await page.locator('#t').evaluate((el) => el.setAttribute('width', '300px'))
    await page.waitForTimeout(200)
    await expect(page.locator('#t .tab-overflow-trigger')).toBeVisible()
  })
})

test.describe('ty-wizard — edge cases', () => {
  test('click step indicator dispatches ty-wizard-step-change with correct detail (controlled component — wizard does not self-manage state)', async ({ page }) => {
    // Unlike ty-tabs (self-manages via setAttribute('active', ...) on
    // click), handleStepClick() in wizard.ts only dispatches an event and
    // explicitly comments "user handles the actual navigation" — the
    // consumer is expected to apply the change themselves (same pattern as
    // ty-calendar's documented stateless-for-external-control mode). Not a
    // bug; asserting the real contract instead of assuming self-management.
    await mount(page, `
      <ty-wizard id="w">
        <ty-step id="s1" label="One">Step 1</ty-step>
        <ty-step id="s2" label="Two">Step 2</ty-step>
        <ty-step id="s3" label="Three">Step 3</ty-step>
      </ty-wizard>
    `)
    const indicators = page.locator('#w .step-indicator')
    expect(await indicators.count()).toBe(3)
    const detailPromise = page.evaluate(() => new Promise((resolve) => {
      document.getElementById('w')!.addEventListener('ty-wizard-step-change', (e: any) => resolve(e.detail), { once: true })
    }))
    await indicators.nth(2).dispatchEvent('pointerdown')
    const detail: any = await detailPromise
    expect(detail.activeIndex).toBe(2)
    // Now apply it ourselves, as a real consumer would: active state is
    // tracked via an `active="<stepId>"` attribute on the WIZARD host
    // itself (getActiveStepId() reads el.getAttribute('active')), not on
    // the individual <ty-step> children.
    await page.locator('#w').evaluate((el, id) => el.setAttribute('active', id), 's3')
    await expect(indicators.nth(2)).toHaveAttribute('aria-selected', 'true')
  })

  test('step with error status renders the error state', async ({ page }) => {
    await mount(page, `
      <ty-wizard id="w">
        <ty-step id="s1" label="One" status="error">Step 1</ty-step>
        <ty-step id="s2" label="Two">Step 2</ty-step>
      </ty-wizard>
    `)
    const circle = page.locator('#w .step-circle').first()
    await expect(circle).toHaveAttribute('data-state', 'error')
  })

  test('single-step wizard does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-wizard id="w"><ty-step id="s1" label="Only">Step</ty-step></ty-wizard>`)
    expect(errors).toEqual([])
  })

  test('zero steps does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await mount(page, `<ty-wizard id="w"></ty-wizard>`)
    expect(errors).toEqual([])
  })
})
