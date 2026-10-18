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
    // Tabs activate on 'click', which native <button>s also fire for Enter/Space.
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

  test('a real pointer click fires ty-tab-change exactly once and leaves focus on the tab', async ({ page }) => {
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
    await expect(page.locator('#t .tab-button').nth(1)).toBeFocused()
  })

  test('a finger swipe that starts on a tab scrolls the strip without activating it', async ({ page, browserName }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch || browserName !== 'chromium', 'needs CDP touch input')
    const tabs = Array.from({ length: 10 }, (_, i) => `<ty-tab id="t${i}" label="Section number ${i}">Panel ${i}</ty-tab>`).join('')
    await mount(page, `<ty-tabs id="t" active="t0">${tabs}</ty-tabs>`)
    const box = (await page.locator('#t .tab-button').nth(1).boundingBox())!
    const y = box.y + box.height / 2
    const x0 = box.x + box.width / 2
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] })
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * 20, y }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForTimeout(300)
    const scrolled = await page.evaluate(() => document.getElementById('t')!.shadowRoot!.querySelector('.tab-strip')!.scrollLeft)
    expect(scrolled).toBeGreaterThan(100)
    await expect(page.locator('#t')).toHaveAttribute('active', 't0')
  })

  test('arrow keys move selection, focus and the roving tabindex (WAI-ARIA tabs pattern)', async ({ page }) => {
    await mount(page, `
      <ty-tabs id="t">
        <ty-tab id="a" label="A">Content A</ty-tab>
        <ty-tab id="b" label="B" disabled>Content B</ty-tab>
        <ty-tab id="c" label="C">Content C</ty-tab>
      </ty-tabs>
    `)
    const btn = (i: number) => page.locator('#t .tab-button').nth(i)
    const expectActive = async (i: number) => {
      await expect(btn(i)).toHaveAttribute('aria-selected', 'true')
      await expect(btn(i)).toHaveAttribute('tabindex', '0')
      await expect(btn(i)).toBeFocused()
    }

    await btn(0).focus()
    await page.keyboard.press('ArrowRight')   // skips the disabled tab
    await expectActive(2)
    await expect(btn(0)).toHaveAttribute('tabindex', '-1')

    await page.keyboard.press('ArrowRight')   // wraps
    await expectActive(0)
    await page.keyboard.press('ArrowLeft')    // wraps back
    await expectActive(2)
    await page.keyboard.press('Home')
    await expectActive(0)
    await page.keyboard.press('End')
    await expectActive(2)
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

// The marker is placed without a transition when it never had a place, or
// had one while the tabs were hidden. The style flush that kept that place
// from animating was a bare `marker.offsetWidth;`, which the CDN build's
// terser dropped: shown again, the marker grew in from nothing.
test('ty-tabs shown after they were hidden: the marker is in place at once', async ({ page }) => {
  await mount(page, `<div id="box" style="display: none; width: 600px"><ty-tabs id="t" active="b"><ty-tab id="a" label="First tab">A</ty-tab><ty-tab id="b" label="Second tab">B</ty-tab></ty-tabs></div>`)
  await page.waitForTimeout(300)
  const r = await page.evaluate(() => new Promise<{ widths: number[]; final: number }>((resolve) => {
    document.getElementById('box')!.style.display = 'block'
    const root = document.getElementById('t')!.shadowRoot!
    const widths: number[] = []
    const tick = () => {
      widths.push(Math.round((root.querySelector('.marker-wrapper') as HTMLElement).getBoundingClientRect().width))
      if (widths.length < 6) requestAnimationFrame(tick)
      else resolve({ widths, final: (root.querySelector("[data-tab-id='b']") as HTMLElement).offsetWidth })
    }
    requestAnimationFrame(() => requestAnimationFrame(tick))
  }))
  const placed = r.widths.filter((w) => w > 0)
  expect(placed.length).toBeGreaterThan(0)
  expect(placed[0]).toBe(r.final)
})

test.describe('ty-tabs — overflow menu', () => {
  const manyTabs = Array.from({ length: 6 }, (_, i) =>
    `<ty-tab id="tab${i}" label="Tab ${i}">Content ${i}</ty-tab>`
  ).join('')

  test('all tabs fit: no overflow trigger appears', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="900px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    expect(await page.locator('#t .tab-overflow-trigger').count()).toBe(0)
  })

  test('narrow container: strip scrolls and the "…" jump menu appears — no tab is hidden', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="300px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    await expect(page.locator('#t .tab-overflow-trigger')).toBeVisible()
    // All buttons stay in the DOM flow (scrollable), none display:none.
    expect(await page.locator('#t .tab-button').count()).toBe(6)
    const overflowing = await page.locator('#t .tab-strip').evaluate(
      (s) => s.scrollWidth > s.clientWidth
    )
    expect(overflowing).toBe(true)
  })

  test('selecting a tab from the jump menu activates it and scrolls it into view', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="300px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(100)
    await page.locator('#t .tab-overflow-trigger').click()
    const lastItem = page.locator('#t .tab-overflow-item').last()
    await expect(lastItem).toBeVisible()
    const label = await lastItem.textContent()
    await lastItem.click()
    // Smooth scroll needs a moment to settle.
    await page.waitForTimeout(600)
    const activeButton = page.locator('#t .tab-button[aria-selected="true"]')
    await expect(activeButton).toHaveText(label!.trim())
    const fullyVisible = await page.locator('#t .tab-strip').evaluate((s) => {
      const btn = s.querySelector('[aria-selected="true"]') as HTMLElement
      const left = btn.offsetLeft
      const right = left + btn.offsetWidth
      return left >= s.scrollLeft - 1 && right <= s.scrollLeft + s.clientWidth + 1
    })
    expect(fullyVisible).toBe(true)
    // Marker frame follows the active tab in the final (scrolled) layout.
    const markerAligned = await page.locator('#t .tab-strip').evaluate((s) => {
      const btn = s.querySelector('[aria-selected="true"]') as HTMLElement
      const marker = s.querySelector('.marker-wrapper') as HTMLElement
      return Math.abs(parseFloat(marker.style.left) - btn.offsetLeft) <= 1
    })
    expect(markerAligned).toBe(true)
  })

  // 6 short tabs squeezed to the 72px floor = 432px of content.
  const CONTENT = 432

  test('a sliver of overflow does not summon the "…" trigger (it costs ~52px to reveal ~5px)', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="${CONTENT - 5}px" height="200px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(200)
    expect(await page.locator('#t .tab-overflow-trigger').count()).toBe(0)
    // The strip keeps the full bar width, so the last tab is one small scroll away.
    const hidden = await page.locator('#t .tab-strip').evaluate(
      (s) => s.scrollWidth - s.clientWidth
    )
    expect(hidden).toBeLessThanOrEqual(10)
    // ...and activating it brings it fully into view. Driven through the
    // `active` attribute — the exact path a click takes (setActiveTab just
    // sets it) minus the narrow-viewport hit-testing a real click needs.
    await page.locator('#t').evaluate((el) => el.setAttribute('active', 'tab5'))
    await page.waitForTimeout(600)
    const fullyVisible = await page.locator('#t .tab-strip').evaluate((s) => {
      const btn = s.querySelector('[aria-selected="true"]') as HTMLElement
      return btn.offsetLeft + btn.offsetWidth <= s.scrollLeft + s.clientWidth + 1
    })
    expect(fullyVisible).toBe(true)
  })

  test('the edge fade never veils more than is actually hidden', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="${CONTENT - 5}px" height="200px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(200)
    const fade = await page.locator('#t .tab-strip').evaluate(
      (s) => parseFloat(s.style.getPropertyValue('--fade-right'))
    )
    expect(fade).toBeGreaterThan(0)
    expect(fade).toBeLessThanOrEqual(10)
  })

  test('activating an already-visible tab does not jerk the strip back and glide in (52px twitch)', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" active="tab0" width="300px" height="200px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(200)
    // Land at the far end first.
    await page.locator('#t').evaluate((el) => el.setAttribute('active', 'tab5'))
    await page.waitForTimeout(600)

    // Activating a neighbour re-centres it — a small, monotonic move. What must
    // NOT happen is the strip jerking backwards past the destination first: the
    // render used to rebuild the "…" trigger, the momentarily widened strip
    // clamped scrollLeft down by the trigger's width, and the ensure-visible
    // glide then slid forward from there.
    const samples = await page.locator('#t').evaluate(async (el: any) => {
      const strip = el.shadowRoot.querySelector('.tab-strip')
      const out: number[] = [Math.round(strip.scrollLeft)]
      let stop = false
      const tick = () => {
        out.push(Math.round(strip.scrollLeft))
        if (!stop) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      el.setAttribute('active', 'tab4')
      await new Promise((r) => setTimeout(r, 600))
      stop = true
      return out
    })
    const start = samples[0]
    const end = samples[samples.length - 1]
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(Math.min(start, end))
    expect(Math.max(...samples)).toBeLessThanOrEqual(Math.max(start, end))
  })

  test('scrollable tabs keep their natural width — they scroll, they never squeeze or ellipsize', async ({ page }) => {
    const labels = ['Overview', 'Runs', 'Recovery', 'Commits', 'Settings']
    const tabs = labels.map((l, i) => `<ty-tab id="n${i}" label="${l}">C${i}</ty-tab>`).join('')

    const measure = () => page.locator('#t').evaluate((el: any) => {
      const buttons = [...el.shadowRoot.querySelectorAll('.tab-button')]
      return {
        widths: buttons.map((b: any) => b.offsetWidth),
        clipped: buttons.some((b: any) => {
          const label = b.querySelector('.tab-label')
          return label ? label.scrollWidth > label.clientWidth + 1 : false
        }),
      }
    })

    await mount(page, `<ty-tabs id="t" width="900px" height="200px">${tabs}</ty-tabs>`)
    await page.waitForTimeout(200)
    const roomy = await measure()
    expect(roomy.clipped).toBe(false)

    // Squeeze the bar well past what the tabs need. Their widths must not budge
    // — the strip scrolls instead. (They are flex items; without flex-shrink: 0
    // they collapse toward the min-width floor and the labels ellipsize before
    // the strip ever overflows.)
    await page.locator('#t').evaluate((el) => el.setAttribute('width', '260px'))
    await page.waitForTimeout(200)
    const squeezed = await measure()
    expect(squeezed.widths).toEqual(roomy.widths)
    expect(squeezed.clipped).toBe(false)
    const hidden = await page.locator('#t .tab-strip').evaluate((s) => s.scrollWidth - s.clientWidth)
    expect(hidden).toBeGreaterThan(0)
  })

  test('fixed: tabs split the bar equally, never overflow, never summon the "…"', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" fixed width="400px" height="200px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(200)
    expect(await page.locator('#t .tab-overflow-trigger').count()).toBe(0)
    const d = await page.locator('#t').evaluate((el: any) => {
      const strip = el.shadowRoot.querySelector('.tab-strip')
      return {
        widths: [...el.shadowRoot.querySelectorAll('.tab-button')].map((b: any) => b.offsetWidth),
        hidden: strip.scrollWidth - strip.clientWidth,
      }
    })
    expect(d.hidden).toBe(0)
    // Equal shares — allow a pixel of sub-pixel rounding between them.
    expect(Math.max(...d.widths) - Math.min(...d.widths)).toBeLessThanOrEqual(1)
    // As scrollable tabs these 6 would floor at 72px each (432px); here they
    // share 400px, so each is narrower than the scrollable floor.
    expect(Math.max(...d.widths)).toBeLessThan(72)
  })

  test('fixed can be toggled at runtime', async ({ page }) => {
    await mount(page, `<ty-tabs id="t" width="300px" height="200px">${manyTabs}</ty-tabs>`)
    await page.waitForTimeout(200)
    await expect(page.locator('#t .tab-overflow-trigger')).toBeVisible()
    await page.locator('#t').evaluate((el) => el.setAttribute('fixed', ''))
    await page.waitForTimeout(200)
    expect(await page.locator('#t .tab-overflow-trigger').count()).toBe(0)
    await page.locator('#t').evaluate((el) => el.removeAttribute('fixed'))
    await page.waitForTimeout(200)
    await expect(page.locator('#t .tab-overflow-trigger')).toBeVisible()
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
