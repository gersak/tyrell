import { test, expect, Page, CDPSession } from '@playwright/test'
import { mount } from './helpers'

/**
 * ty-sortable on touch. page.touchscreen can only tap, so drags go through
 * CDP Input.dispatchTouchEvent — real touch input, with the browser's own
 * scroll/drag arbitration (touch-action, pointercancel).
 */

const CARD = 'height:56px;margin:0 0 8px;background:#ddd;display:flex;align-items:center;gap:8px'

function list(keys: string[], withHandles = false): string {
  return `<ty-sortable id="a" style="display:block;--ty-sortable-duration:0ms">
    ${keys.map((k) => `<div data-key="${k}" style="${CARD}">${withHandles ? '<button type="button" data-handle style="width:44px;height:44px">=</button>' : ''}<span>${k}</span></div>`).join('')}
  </ty-sortable>
  <div style="height:2000px"></div>`
}

async function center(page: Page, selector: string): Promise<{ x: number; y: number }> {
  const box = (await page.locator(selector).boundingBox())!
  return { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) }
}

async function touch(cdp: CDPSession, type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) {
  await cdp.send('Input.dispatchTouchEvent', {
    type,
    touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
  })
}

/** Finger down, optional hold, move in steps, lift. */
async function touchDrag(page: Page, cdp: CDPSession, from: { x: number; y: number }, to: { x: number; y: number }, holdMs: number) {
  await touch(cdp, 'touchStart', from.x, from.y)
  if (holdMs) await page.waitForTimeout(holdMs)
  const steps = 8
  for (let i = 1; i <= steps; i++) {
    await touch(cdp, 'touchMove', Math.round(from.x + ((to.x - from.x) * i) / steps), Math.round(from.y + ((to.y - from.y) * i) / steps))
    await page.waitForTimeout(16)
  }
  await page.waitForTimeout(50)
  await touch(cdp, 'touchEnd', to.x, to.y)
}

async function recordChanges(page: Page) {
  await page.evaluate(() => {
    ;(window as any).changes = []
    document.addEventListener('ty-sortable-change', (e: any) => (window as any).changes.push(e.detail.value), true)
  })
}

const changes = (page: Page) => page.evaluate(() => (window as any).changes as any[])

test.describe('ty-sortable touch', () => {
  test('long-press on an item picks it up and drops it', async ({ page }) => {
    await mount(page, list(['1', '2', '3']))
    await recordChanges(page)
    const cdp = await page.context().newCDPSession(page)
    const from = await center(page, '[data-key="1"]')
    const to = await center(page, '[data-key="3"]')
    await touchDrag(page, cdp, from, { x: to.x, y: to.y + 15 }, 400)
    const v = await changes(page)
    expect(v.length).toBe(1)
    expect(v[0].to.index).toBe(2)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('a quick swipe scrolls the page and moves nothing', async ({ page }) => {
    await mount(page, list(['1', '2', '3']))
    await recordChanges(page)
    const cdp = await page.context().newCDPSession(page)
    const from = await center(page, '[data-key="3"]')
    await touchDrag(page, cdp, from, { x: from.x, y: from.y - 150 }, 0)
    await page.waitForTimeout(100)
    expect(await changes(page)).toEqual([])
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  })

  test('a handle drags at once, without a long-press', async ({ page }) => {
    await mount(page, list(['1', '2', '3'], true))
    await recordChanges(page)
    const cdp = await page.context().newCDPSession(page)
    const from = await center(page, '[data-key="1"] [data-handle]')
    const to = await center(page, '[data-key="3"]')
    await touchDrag(page, cdp, from, { x: from.x, y: to.y + 15 }, 0)
    const v = await changes(page)
    expect(v.length).toBe(1)
    expect(v[0].to.index).toBe(2)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })

  test('with handles, the rest of the item scrolls', async ({ page }) => {
    await mount(page, list(['1', '2', '3'], true))
    await recordChanges(page)
    const cdp = await page.context().newCDPSession(page)
    const from = await center(page, '[data-key="3"] span')
    await touchDrag(page, cdp, from, { x: from.x, y: from.y - 150 }, 400)
    await page.waitForTimeout(100)
    expect(await changes(page)).toEqual([])
  })

  test('the tap after a drag is not swallowed', async ({ page }) => {
    await mount(page, list(['1', '2'], true) + '<button id="after" style="position:fixed;top:0;right:0;width:80px;height:44px">x</button>')
    await recordChanges(page)
    await page.evaluate(() => {
      ;(window as any).clicks = 0
      document.getElementById('after')!.addEventListener('click', () => (window as any).clicks++)
    })
    const cdp = await page.context().newCDPSession(page)
    const from = await center(page, '[data-key="1"] [data-handle]')
    const to = await center(page, '[data-key="2"]')
    await touchDrag(page, cdp, from, { x: from.x, y: to.y + 15 }, 0)
    await page.waitForTimeout(50)
    await page.tap('#after')
    expect(await page.evaluate(() => (window as any).clicks)).toBe(1)
  })

  test('shift on touch: siblings move aside under the finger, the drop lands', async ({ page }) => {
    await mount(page, list(['1', '2', '3'], true))
    await recordChanges(page)
    const cdp = await page.context().newCDPSession(page)
    const from = await center(page, '[data-key="1"] [data-handle]')
    const to = await center(page, '[data-key="3"]')
    await touch(cdp, 'touchStart', from.x, from.y)
    for (let i = 1; i <= 8; i++) {
      await touch(cdp, 'touchMove', from.x, Math.round(from.y + ((to.y + 15 - from.y) * i) / 8))
      await page.waitForTimeout(16)
    }
    await page.waitForTimeout(250)
    const shifted = await page.evaluate(() => {
      const t = getComputedStyle(document.querySelector('[data-key="2"]')!).translate
      return t === 'none' ? 0 : parseFloat(t.split(' ')[1] ?? '0')
    })
    expect(shifted).toBeLessThan(-20)
    await touch(cdp, 'touchEnd', from.x, to.y + 15)
    const v = await changes(page)
    expect(v.length).toBe(1)
    expect(v[0].to.index).toBe(2)
  })
})
